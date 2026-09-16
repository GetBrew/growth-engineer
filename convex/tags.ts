import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { TAG_NAMESPACES } from './model/keys'
import { publicQuery } from './shared/builders'
import { tagDoc } from './shared/validators'

/** The managed tag list. Active tags only; proposals live in the admin queue. */

const namespaceValidator = v.union(
  ...TAG_NAMESPACES.map((namespace) => v.literal(namespace))
)

/** Active tags, one namespace or all of them (the filter chips and completion). */
export const listActive = publicQuery({
  args: { namespace: v.optional(namespaceValidator) },
  returns: v.array(tagDoc),
  handler: async (ctx, args) => {
    const namespaces = args.namespace ? [args.namespace] : TAG_NAMESPACES
    const perNamespace = await Promise.all(
      namespaces.map((namespace) =>
        ctx.db
          .query('tags')
          .withIndex('by_namespace', (q) =>
            q.eq('namespace', namespace).eq('status', 'active')
          )
          .take(200)
      )
    )
    const tags: Array<Doc<'tags'>> = perNamespace.flat()
    return tags
  },
})

/** Typing "enrichment" suggests `capability:enrich-contacts`: label + synonyms. */
export const suggest = publicQuery({
  args: { q: v.string(), limit: v.optional(v.number()) },
  returns: v.array(tagDoc),
  handler: async (ctx, args) => {
    const query = args.q.trim()
    if (!query) {
      return []
    }
    return await ctx.db
      .query('tags')
      .withSearchIndex('search_tags', (q) =>
        q.search('searchText', query).eq('status', 'active')
      )
      .take(Math.min(args.limit ?? 5, 20))
  },
})
