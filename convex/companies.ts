import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { publicQuery } from './shared/builders'
import { companyDoc, nullableCompanyDoc } from './shared/validators'

/**
 * Company reads. Every read is indexed and bounded; a key is resolved once
 * through `by_key` and the handler works with ids from there.
 */

const MAX_LIST = 200

const ACCESS_ORDER = ['mcp', 'cli', 'api'] as const

const categorised = v.object({
  company: companyDoc,
  category: v.optional(v.object({ slug: v.string(), label: v.string() })),
  /** How agents reach this company's published tools: MCP, CLI, API. */
  access: v.array(
    v.union(v.literal('mcp'), v.literal('cli'), v.literal('api'))
  ),
})

/** The company's `category:*` tag, if it has an active one. */
async function categoryOf(
  ctx: QueryCtx,
  company: Doc<'companies'>
): Promise<{ slug: string; label: string } | undefined> {
  const taggings = await ctx.db
    .query('taggings')
    .withIndex('by_entity_tag', (q) => q.eq('entityId', company._id))
    .take(16)
  const tags = await Promise.all(
    taggings
      .filter((tagging) => tagging.namespace === 'category')
      .map((tagging) => ctx.db.get(tagging.tagId))
  )
  const tag = tags.find((entry) => entry !== null && entry.status === 'active')
  return tag ? { slug: tag.slug, label: tag.label } : undefined
}

/**
 * The ways in across a company's published tools, in setup order. A directory
 * row states a FACT — this vendor is reachable over MCP — rather than a
 * decorative badge, so it is read from the tools, never assumed.
 */
async function accessOf(
  ctx: QueryCtx,
  company: Doc<'companies'>
): Promise<Array<'mcp' | 'cli' | 'api'>> {
  const tools = await ctx.db
    .query('tools')
    .withIndex('by_company', (q) =>
      q.eq('companyId', company._id).eq('status', 'published')
    )
    .take(20)
  const types = new Set(
    tools.flatMap((tool) => tool.access.map((entry) => entry.type))
  )
  return ACCESS_ORDER.filter((type) => types.has(type))
}

/** Attach each company's category and ways in — what the directory shows. */
async function withCategory(
  ctx: QueryCtx,
  companies: ReadonlyArray<Doc<'companies'>>
): Promise<
  Array<{
    company: Doc<'companies'>
    category?: { slug: string; label: string }
    access: Array<'mcp' | 'cli' | 'api'>
  }>
> {
  return await Promise.all(
    companies.map(async (company) => {
      const [category, access] = await Promise.all([
        categoryOf(ctx, company),
        accessOf(ctx, company),
      ])
      return category ? { company, category, access } : { company, access }
    })
  )
}

/** Published companies, newest first, with their category. */
export const list = publicQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(categorised),
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query('companies')
      .withIndex('by_status_published', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(Math.min(args.limit ?? MAX_LIST, MAX_LIST))
    return await withCategory(ctx, companies)
  },
})

/**
 * One company by handle. Deprecated listings stay visible (the page shows a
 * warning); archived ones are hidden and their old keys redirect via aliases.
 */
export const getByKey = publicQuery({
  args: { key: v.string() },
  returns: nullableCompanyDoc,
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()
    if (!company) {
      return null
    }
    return company.status === 'published' || company.status === 'deprecated'
      ? company
      : null
  },
})

/** Full-text search over name, tagline and category, with the category attached. */
export const search = publicQuery({
  args: { q: v.string(), limit: v.optional(v.number()) },
  returns: v.array(categorised),
  handler: async (ctx, args) => {
    const query = args.q.trim()
    if (!query) {
      return []
    }
    const companies = await ctx.db
      .query('companies')
      .withSearchIndex('search_companies', (q) =>
        q.search('searchText', query).eq('status', 'published')
      )
      .take(Math.min(args.limit ?? 50, MAX_LIST))
    return await withCategory(ctx, companies)
  },
})
