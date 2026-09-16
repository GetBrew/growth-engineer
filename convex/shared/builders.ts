import { v } from 'convex/values'
import {
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import { mutation, query } from '../_generated/server'
import {
  type OrgActor,
  requireOrgActor,
  requireOrgAdmin,
  requireServiceToken,
  requireUserActor,
  type UserActor,
} from './auth'

/**
 * TIER-NAMED FUNCTION BUILDERS — authorization by construction.
 *
 * The convention these replace was: declare the transport args by hand, then
 * remember to call the right guard as the first statement of the handler. Both
 * halves are unenforceable — a reviewer has to prove, per function, that no
 * early return slips past the check. These builders make it structural:
 *
 *   1. THE GUARD CANNOT BE SKIPPED. `customQuery`/`customMutation` run the
 *      customization's `input` BEFORE the handler is entered. There is no
 *      ordering to verify and no path around it.
 *
 *   2. THE CALLER'S CLAIM NEVER REACHES THE HANDLER. Each builder DECLARES the
 *      transport args and CONSUMES them (`input` returns `args: {}`), so the
 *      handler's `args` holds only its own domain fields. A handler physically
 *      cannot read a caller-supplied `orgId`; it reads the verified one from
 *      `ctx.actor`. Cross-tenant access stops being a mistake you can make.
 *
 *   3. THE TIER IS THE CONSTRUCTOR. `orgAdminMutation` is greppable, obvious
 *      in a diff, and machine-readable — reviewers and agents read the
 *      builder name instead of re-deriving intent from the body.
 *
 * NEVER re-declare an arg a builder consumed (`orgId`, `serviceToken`,
 * `actingUserId`, …): the shadowing declaration would hand the handler an
 * UNVERIFIED value under a name that reads exactly like the verified one.
 * tests/convex-builders.test.ts fails if you do.
 */

/**
 * What a trusted SERVER caller may send. Optional at the wire because the
 * browser path authenticates with its Convex JWT alone; the guards enforce the
 * pairing (a token that names nobody is refused).
 */
const CALLER_TRANSPORT = {
  serviceToken: v.optional(v.string()),
  actingUserId: v.optional(v.string()),
  actingOrgId: v.optional(v.string()),
  actingOrgRole: v.optional(v.string()),
} as const

/**
 * Service-only transport: the token is REQUIRED, and that is the whole point
 * of the tier. An optional token is a runtime-only guarantee — `tsc` cannot
 * see a caller that forgot it and the function merely refuses at execution
 * time. A required one is a WIRE-LEVEL guarantee: a browser cannot form a
 * well-typed call, so the function is unreachable rather than refused.
 */
const SERVICE_TRANSPORT = {
  serviceToken: v.string(),
} as const

type UserCtx = { actor: UserActor }
type OrgCtx = { actor: OrgActor }

/** PUBLIC. Deliberately unauthenticated — anyone on the internet. */
export const publicQuery = customQuery(query, {
  args: {},
  input: () => ({ ctx: {}, args: {} }),
})

/** Any verified human. Use for resources keyed by the user, not a tenant. */
export const authenticatedQuery = customQuery(query, {
  args: CALLER_TRANSPORT,
  input: async (ctx, args): Promise<{ ctx: UserCtx; args: object }> => ({
    ctx: { actor: await requireUserActor(ctx, args) },
    args: {},
  }),
})

/** Any verified human. See {@link authenticatedQuery}. */
export const authenticatedMutation = customMutation(mutation, {
  args: CALLER_TRANSPORT,
  input: async (ctx, args): Promise<{ ctx: UserCtx; args: object }> => ({
    ctx: { actor: await requireUserActor(ctx, args) },
    args: {},
  }),
})

/** Any member of the verified organization. `ctx.actor.orgId` is the tenant. */
export const orgMemberQuery = customQuery(query, {
  args: CALLER_TRANSPORT,
  input: async (ctx, args): Promise<{ ctx: OrgCtx; args: object }> => ({
    ctx: { actor: await requireOrgActor(ctx, args) },
    args: {},
  }),
})

/** Any member of the verified organization. See {@link orgMemberQuery}. */
export const orgMemberMutation = customMutation(mutation, {
  args: CALLER_TRANSPORT,
  input: async (ctx, args): Promise<{ ctx: OrgCtx; args: object }> => ({
    ctx: { actor: await requireOrgActor(ctx, args) },
    args: {},
  }),
})

/** The organization control plane: billing, members, destructive operations. */
export const orgAdminMutation = customMutation(mutation, {
  args: CALLER_TRANSPORT,
  input: async (ctx, args): Promise<{ ctx: OrgCtx; args: object }> => ({
    ctx: { actor: await requireOrgAdmin(ctx, args) },
    args: {},
  }),
})

/** Machine callers only — crons, webhooks, queues. Unreachable from a browser. */
export const serviceMutation = customMutation(mutation, {
  args: SERVICE_TRANSPORT,
  input: (_ctx, args) => {
    requireServiceToken(args.serviceToken)
    return { ctx: {}, args: {} }
  },
})
