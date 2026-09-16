import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { publicQuery } from './shared/builders'

/**
 * Old keys that redirect. Keys never change after publishing; a merge or a
 * rare forced rename adds a `keyAliases` row, and every miss on `by_key` asks
 * here before answering 404. The `.md` handler turns a hit into a real 308.
 */
export const resolve = publicQuery({
  args: {
    entityType: v.union(
      v.literal('company'),
      v.literal('tool'),
      v.literal('workflow')
    ),
    key: v.string(),
  },
  returns: v.union(v.null(), v.object({ key: v.string() })),
  handler: async (ctx, args) => {
    const alias = await ctx.db
      .query('keyAliases')
      .withIndex('by_type_key', (q) =>
        q.eq('entityType', args.entityType).eq('oldKey', args.key)
      )
      .unique()
    if (!alias) {
      return null
    }
    switch (args.entityType) {
      case 'company': {
        const company = await ctx.db.get(alias.entityId as Id<'companies'>)
        return company ? { key: company.key } : null
      }
      case 'tool': {
        const tool = await ctx.db.get(alias.entityId as Id<'tools'>)
        return tool ? { key: tool.key } : null
      }
      case 'workflow': {
        const workflow = await ctx.db.get(alias.entityId as Id<'workflows'>)
        return workflow ? { key: workflow.key } : null
      }
      default:
        return null
    }
  },
})
