import { type Infer, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { publicQuery } from './shared/builders'
import { getMany } from './shared/reads'
import { companyRow, nullableCompanyDoc } from './shared/validators'

/**
 * Company reads. Every read is indexed and bounded; a key is resolved once
 * through `by_key` and the handler works with ids from there.
 */

const MAX_LIST = 200

const ACCESS_ORDER = ['mcp', 'cli', 'api'] as const
type Row = Infer<typeof companyRow>
type Category = NonNullable<Row['category']>

function listSummary(company: Doc<'companies'>): Row['company'] {
  return {
    _id: company._id,
    key: company.key,
    name: company.name,
    ...(company.tagline === undefined ? {} : { tagline: company.tagline }),
    ...(company.description === undefined
      ? {}
      : { description: company.description }),
    ...(company.domain === undefined ? {} : { domain: company.domain }),
    ...(company.logo ? { logoUrl: company.logo.url } : {}),
  }
}

async function activeCategory(
  ctx: QueryCtx,
  slug: string
): Promise<(Doc<'tags'> & { namespace: 'category' }) | null> {
  const tag = await ctx.db
    .query('tags')
    .withIndex('by_key', (q) => q.eq('key', `category:${slug}`))
    .unique()
  return tag?.status === 'active' && tag.namespace === 'category'
    ? (tag as Doc<'tags'> & { namespace: 'category' })
    : null
}

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
async function toRows(
  ctx: QueryCtx,
  companies: ReadonlyArray<Doc<'companies'>>,
  options: { category?: Category; shouldIncludeCategory?: boolean } = {}
): Promise<Array<Row>> {
  return await Promise.all(
    companies.map(async (company) => {
      let categoryPromise: Promise<Category | undefined>
      if (options.category) {
        categoryPromise = Promise.resolve(options.category)
      } else if (options.shouldIncludeCategory === false) {
        categoryPromise = Promise.resolve(undefined)
      } else {
        categoryPromise = categoryOf(ctx, company)
      }
      const [category, access] = await Promise.all([
        categoryPromise,
        accessOf(ctx, company),
      ])
      const summary = listSummary(company)
      return category
        ? { company: summary, category, access }
        : { company: summary, access }
    })
  )
}

async function listInCategory(
  ctx: QueryCtx,
  category: Doc<'tags'>,
  limit: number
): Promise<Array<Doc<'companies'>>> {
  const taggings = await ctx.db
    .query('taggings')
    .withIndex('by_tag_new', (q) =>
      q.eq('tagId', category._id).eq('entityType', 'company').eq('listed', true)
    )
    .order('desc')
    .take(limit)
  const ids = taggings.flatMap((tagging) =>
    tagging.entityType === 'company' ? [tagging.entityId] : []
  )
  const companies = await getMany(ctx, ids)
  return ids.flatMap((id) => {
    const company = companies.get(id)
    return company ? [company] : []
  })
}

async function filterByCategory(
  ctx: QueryCtx,
  companies: ReadonlyArray<Doc<'companies'>>,
  category: Doc<'tags'>
): Promise<Array<Doc<'companies'>>> {
  const taggings = await Promise.all(
    companies.map((company) =>
      ctx.db
        .query('taggings')
        .withIndex('by_entity_tag', (q) =>
          q.eq('entityId', company._id).eq('tagId', category._id)
        )
        .unique()
    )
  )
  return companies.filter((_, index) => taggings[index] !== null)
}

/** Published companies, newest first, with their category. */
export const list = publicQuery({
  args: {
    category: v.optional(v.string()),
    includeCategory: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.array(companyRow),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? MAX_LIST, MAX_LIST)
    if (args.category) {
      const category = await activeCategory(ctx, args.category)
      if (!category) {
        return []
      }
      return await toRows(ctx, await listInCategory(ctx, category, limit), {
        category: { slug: category.slug, label: category.label },
      })
    }
    const companies = await ctx.db
      .query('companies')
      .withIndex('by_status_published', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(limit)
    return await toRows(ctx, companies, {
      shouldIncludeCategory: args.includeCategory !== false,
    })
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
  args: {
    q: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(companyRow),
  handler: async (ctx, args) => {
    const query = args.q.trim()
    if (!query) {
      return []
    }
    const limit = Math.min(args.limit ?? 50, MAX_LIST)
    const category = args.category
      ? await activeCategory(ctx, args.category)
      : null
    if (args.category && !category) {
      return []
    }
    const candidates = await ctx.db
      .query('companies')
      .withSearchIndex('search_companies', (q) =>
        q.search('searchText', query).eq('status', 'published')
      )
      .take(category ? MAX_LIST : limit)
    const companies = category
      ? await filterByCategory(ctx, candidates, category)
      : candidates
    return await toRows(
      ctx,
      companies.slice(0, limit),
      category
        ? { category: { slug: category.slug, label: category.label } }
        : undefined
    )
  },
})
