import { v } from 'convex/values'
import {
  authenticatedMutation,
  authenticatedQuery,
  orgMemberQuery,
} from './shared/builders'
import { invalidInput, notFound } from './shared/errors'

/**
 * Worked example of the whole pattern. Copy its SHAPE, not its domain:
 *
 *   - the tier builder is the constructor, so the guard cannot be skipped
 *   - `args` carries domain fields only; identity comes from `ctx.actor`
 *   - every read goes through `.withIndex(...)`, never `.filter(...)`
 *   - `returns` is declared, so a handler that drifts fails `tsc`, not a page
 *   - ownership is re-checked on the row itself, because an id is not a claim
 */

const MAX_TITLE_LENGTH = 200

const taskValidator = v.object({
  _id: v.id('tasks'),
  _creationTime: v.number(),
  userId: v.string(),
  orgId: v.optional(v.string()),
  title: v.string(),
  isCompleted: v.boolean(),
  createdAt: v.number(),
})

/** The signed-in user's own tasks, newest first. */
export const list = authenticatedQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(taskValidator),
  handler: async (ctx, args) => {
    // `.take(n)` is not optional politeness: an unbounded `.collect()` on a
    // table that grew in production is a 16 MB read limit and a hard outage on
    // a page that worked for a year.
    return await ctx.db
      .query('tasks')
      .withIndex('by_user_and_created', (q) => q.eq('userId', ctx.actor.userId))
      .order('desc')
      .take(Math.min(args.limit ?? 50, 200))
  },
})

/**
 * Everything in the caller's organization.
 *
 * Note what is NOT here: an `orgId` argument. The tenant is read from the
 * verified claim on `ctx.actor`, so no caller can name someone else's.
 */
export const listForOrg = orgMemberQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(taskValidator),
  handler: async (ctx, args) =>
    await ctx.db
      .query('tasks')
      .withIndex('by_org_and_created', (q) => q.eq('orgId', ctx.actor.orgId))
      .order('desc')
      .take(Math.min(args.limit ?? 50, 200)),
})

export const create = authenticatedMutation({
  args: { title: v.string() },
  returns: v.id('tasks'),
  handler: async (ctx, args) => {
    const title = args.title.trim()
    if (!title) {
      invalidInput('A task needs a title.')
    }
    if (title.length > MAX_TITLE_LENGTH) {
      invalidInput(`Keep the title under ${MAX_TITLE_LENGTH} characters.`)
    }

    return await ctx.db.insert('tasks', {
      userId: ctx.actor.userId,
      // An org-scoped actor would carry `orgId` here; a personal task does not.
      title,
      isCompleted: false,
      createdAt: Date.now(),
    })
  },
})

export const setCompleted = authenticatedMutation({
  args: { taskId: v.id('tasks'), isCompleted: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    // A row-level ownership check, on every id-addressed write. The tier
    // builder proved WHO is calling; only the row can prove they own it.
    // "Not yours" answers as "not found" so ids cannot be enumerated.
    if (!task || task.userId !== ctx.actor.userId) {
      notFound('Task not found.')
    }
    await ctx.db.patch(args.taskId, { isCompleted: args.isCompleted })
    return null
  },
})

export const remove = authenticatedMutation({
  args: { taskId: v.id('tasks') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== ctx.actor.userId) {
      notFound('Task not found.')
    }
    await ctx.db.delete(args.taskId)
    return null
  },
})
