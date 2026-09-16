import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * THE schema root. Keep this file the single stable `defineSchema(...)`
 * default export; when it grows, split tables into colocated `schema_*.ts`
 * modules and compose them here rather than exporting a second schema.
 *
 * INDEXES ARE NOT OPTIONAL. Convex has no query planner: a read without a
 * matching index scans the table, and a table that is small in development is
 * a 16 MB read limit in production. Every field you filter or sort on belongs
 * in an index, named for the fields it carries (`by_user_and_created`), and
 * `.withIndex(...)` is how you read — `.filter(...)` is a scan wearing a
 * predicate.
 */
export default defineSchema({
  /**
   * Mirror of the Clerk user, written by the Clerk webhook
   * (app/api/webhooks/clerk/route.ts).
   *
   * WHY MIRROR AT ALL: a Convex function cannot call Clerk's API mid-query, so
   * without a local row you cannot join a task to a display name, sort by it,
   * or show a member list without an N+1 of HTTP calls. The JWT stays the
   * source of truth for AUTHORIZATION; this table is for DISPLAY.
   */
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_clerk_user_id', ['clerkUserId']),

  /**
   * Example domain table. Every row carries its owner, and — when the app uses
   * Clerk organizations — its tenant.
   *
   * `orgId` IS ON THE ROW, not derived at read time. A tenant boundary you
   * have to reconstruct from a join is a tenant boundary one forgotten join
   * away from leaking.
   */
  tasks: defineTable({
    userId: v.string(),
    orgId: v.optional(v.string()),
    title: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user_and_created', ['userId', 'createdAt'])
    .index('by_org_and_created', ['orgId', 'createdAt']),
})
