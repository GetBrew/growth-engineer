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

const categorised = v.object({
  company: companyDoc,
  category: v.optional(v.object({ slug: v.string(), label: v.string() })),
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

/** Attach each company's category — what the directory groups by. */
async function withCategory(
  ctx: QueryCtx,
  companies: ReadonlyArray<Doc<'companies'>>
): Promise<
  Array<{
    company: Doc<'companies'>
    category?: { slug: string; label: string }
  }>
> {
  return await Promise.all(
    companies.map(async (company) => {
      const category = await categoryOf(ctx, company)
      return category ? { company, category } : { company }
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
