import { v } from 'convex/values'
import { authenticatedQuery, serviceMutation } from './shared/builders'

/**
 * The Clerk user mirror (schema v0.3 `users`). Clerk owns the account; this
 * row exists so a workflow can be joined to an author and a review to a
 * reviewer without an HTTP call per row.
 *
 * Written ONLY by the webhook route (app/api/webhooks/clerk/route.ts) through
 * `serviceMutation`, so a browser cannot reach it — a profile any client can
 * write is a display-name spoofing surface.
 */

/** Upsert from `user.created` / `user.updated`. Matches by Clerk id, then email. */
export const upsertFromClerk = serviceMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const byClerkId = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', args.clerkUserId))
      .unique()
    // An admin may have created the row (by email) before the person signed
    // in; the first sign-in claims it rather than duplicating it. TWO ways
    // that claim becomes someone else's account, so both are closed here:
    // a BLANK email (Clerk sends none for a phone-only account, and `by_email`
    // on '' hands the next such person the first one's row), and a row that
    // already belongs to a different Clerk account.
    const byEmail = args.email
      ? await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', args.email))
          .unique()
      : null
    const existing = byClerkId ?? (byEmail?.clerkUserId ? null : byEmail)

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      })
    } else {
      await ctx.db.insert('users', {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role: 'member',
      })
    }
    return null
  },
})

/** `user.deleted`: the account is gone; the row goes with it. */
export const deleteFromClerk = serviceMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', args.clerkUserId))
      .unique()
    if (existing) {
      // Everything keyed by this user is deleted HERE, in the same change that
      // adds the table. Workflows they authored keep their key and their file.
      await ctx.db.delete(existing._id)
    }
    return null
  },
})

/** The signed-in person's mirrored row; null until the webhook has landed. */
export const current = authenticatedQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      handle: v.optional(v.string()),
      clerkUserId: v.optional(v.string()),
      email: v.string(),
      name: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.union(
        v.literal('admin'),
        v.literal('moderator'),
        v.literal('member')
      ),
      teamId: v.optional(v.id('teams')),
    })
  ),
  handler: async (ctx) =>
    await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', ctx.actor.userId))
      .unique(),
})
