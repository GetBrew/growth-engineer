import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { markStaleForTool, renderAndStoreDocument } from './documents_render'
import { publicQuery } from './shared/builders'
import { nullableDocumentDoc } from './shared/validators'

/**
 * The rendered markdown files. Pages, the Copy button, `.md` URLs, MCP `get`
 * and `/llms.txt` all read ONE row here; nothing renders on the request path.
 */

/** The file for a ref: `tool:clay/clay`, `workflow:brew/intent-to-meeting`. */
export const getByRef = publicQuery({
  args: { ref: v.string() },
  returns: nullableDocumentDoc,
  handler: async (ctx, args) =>
    await ctx.db
      .query('documents')
      .withIndex('by_ref', (q) => q.eq('ref', args.ref))
      .unique(),
})

/**
 * Every file, newest first — the `/llms.txt` index and (later) MCP `list`.
 *
 * Deliberately NOT filtered by `stale`: a stale file is one waiting to be
 * re-rendered, and it still serves at its `.md` URL. Filtering here would
 * drop a tool, its company and every dependent workflow from the index for
 * as long as the render queue takes (`convex/catalog.test.ts` pins this).
 */
export const listRefs = publicQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      ref: v.string(),
      entityType: v.union(
        v.literal('company'),
        v.literal('tool'),
        v.literal('workflow')
      ),
      renderedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_rendered')
      .order('desc')
      .take(Math.min(args.limit ?? 1000, 1000))
    return documents.map(({ ref, entityType, renderedAt }) => ({
      ref,
      entityType,
      renderedAt,
    }))
  },
})

/* ─────────────────── render pipeline (internal, never public) ─────────────────── */

const target = v.union(
  v.object({ type: v.literal('company'), id: v.id('companies') }),
  v.object({ type: v.literal('tool'), id: v.id('tools') }),
  v.object({ type: v.literal('workflow'), id: v.id('workflows') })
)

/** Re-render one entity's file now. */
export const renderEntity = internalMutation({
  args: { target },
  returns: v.union(
    v.literal('rendered'),
    v.literal('unchanged'),
    v.literal('skipped')
  ),
  handler: async (ctx, args) =>
    await renderAndStoreDocument(ctx, args.target, Date.now()),
})

/** A tool changed: mark its own file, its company's and every dependent workflow's stale. */
export const markToolStale = internalMutation({
  args: { toolId: v.id('tools') },
  returns: v.number(),
  handler: async (ctx, args) =>
    await markStaleForTool(ctx, args.toolId, Date.now()),
})

/** The scheduled batch: re-render the oldest stale files, a bounded number at a time. */
export const renderStale = internalMutation({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    rendered: v.number(),
    unchanged: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    const stale = await ctx.db
      .query('documents')
      .withIndex('by_stale', (q) => q.eq('stale', true))
      .order('asc')
      .take(Math.min(args.limit ?? 20, 50))
    const counts = { rendered: 0, unchanged: 0, skipped: 0 }
    const now = Date.now()
    for (const document of stale) {
      // biome-ignore lint/performance/noAwaitInLoops: each render reads and writes; sequential inside one mutation, by design
      const outcome = await renderAndStoreDocument(
        ctx,
        { type: document.entityType, id: document.entityId } as Parameters<
          typeof renderAndStoreDocument
        >[1],
        now
      )
      counts[outcome] += 1
    }
    return counts
  },
})
