import { v } from 'convex/values'
import { authenticatedQuery, serviceMutation } from './shared/builders'

/**
 * The Clerk user mirror.
 *
 * Written ONLY by the webhook route (app/api/webhooks/clerk/route.ts) through
 * `serviceMutation`, so a browser cannot reach it at all — a user profile that
 * any client can write is a display-name spoofing surface.
 */

/** Upsert from a Clerk `user.created` / `user.updated` webhook. */
export const upsertFromClerk = serviceMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) =>
        q.eq('clerkUserId', args.clerkUserId)
      )
      .unique()

    const fields = {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, fields)
    } else {
      await ctx.db.insert('users', fields)
    }
    return null
  },
})

/** Delete on a Clerk `user.deleted` webhook. */
export const deleteFromClerk = serviceMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) =>
        q.eq('clerkUserId', args.clerkUserId)
      )
      .unique()
    if (existing) {
      // Deleting a user means deleting what they own. Add every table keyed by
      // this user HERE, in the same change that adds the table — a cascade
      // nobody updates is how orphaned rows outlive the account.
      await ctx.db.delete(existing._id)
    }
    return null
  },
})

/** The signed-in user's own mirrored profile. Returns null before the webhook lands. */
export const current = authenticatedQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      email: v.string(),
      name: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) =>
    await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) =>
        q.eq('clerkUserId', ctx.actor.userId)
      )
      .unique(),
})
