import type { Auth } from 'convex/server'
import { notAuthenticated, notAuthorized } from './errors'

/**
 * The reviewed authorization guards. Every tier builder in ./builders.ts
 * delegates here, so there is exactly ONE place where each decision is made.
 * Read this file before adding a builder; do not re-implement a check.
 */

/**
 * These guards read identity and nothing else — so they take the smallest
 * context that can provide it, and every query, mutation and action ctx
 * satisfies it.
 */
type AuthCtx = { auth: Auth }

/** Clerk's org claims ride the named JWT template; Convex types them loosely. */
type Identity = Awaited<ReturnType<Auth['getUserIdentity']>> & {
  orgId?: unknown
  orgRole?: unknown
}

/** Transport fields a trusted SERVER caller may send. Never trusted alone. */
export type CallerTransport = {
  serviceToken?: string
  actingUserId?: string
  actingOrgId?: string
  actingOrgRole?: string
}

/**
 * The verified caller. Deliberately minimal: the JWT carries AUTHORIZATION
 * claims, and display data (name, email, avatar) comes from the `users` mirror
 * the Clerk webhook writes. Every field here is one more thing each guard has
 * to keep true on BOTH the browser and the service path.
 */
export type UserActor = {
  userId: string
}

export type OrgActor = UserActor & {
  orgId: string
  orgRole: string | null
  isOrgAdmin: boolean
}

function claimString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Verify the shared service token in constant time.
 *
 * `===` on a secret leaks its length and its matching prefix through timing.
 * That is a real attack on a token an attacker can submit repeatedly — which
 * is exactly what a public Convex function is.
 */
function verifyServiceToken(token: string | undefined): boolean {
  const expected = process.env.CONVEX_SERVICE_TOKEN
  if (!(expected && token) || expected.length !== token.length) {
    return false
  }
  let mismatch = 0
  for (let index = 0; index < expected.length; index += 1) {
    // biome-ignore lint/suspicious/noBitwiseOperators: constant-time compare
    mismatch |= expected.charCodeAt(index) ^ token.charCodeAt(index)
  }
  return mismatch === 0
}

export function requireServiceToken(token: string | undefined): void {
  if (!verifyServiceToken(token)) {
    notAuthorized('Invalid service token.')
  }
}

/**
 * Any verified human identity.
 *
 * TWO TRANSPORTS, ONE RULE. The browser presents a Clerk JWT, so the identity
 * is read from the token and the caller cannot name anyone but themselves. A
 * server caller presents the service token, which proves only that the CALL
 * came from our deployment — it is never authority to act as a person, so the
 * person it names (`actingUserId`) is carried separately and a token without
 * one is refused for anything user-scoped.
 */
export async function requireUserActor(
  ctx: AuthCtx,
  transport: CallerTransport
): Promise<UserActor> {
  if (transport.serviceToken !== undefined) {
    requireServiceToken(transport.serviceToken)
    const userId = claimString(transport.actingUserId)
    if (!userId) {
      notAuthorized('Server calls must name the acting user.')
    }
    return { userId }
  }

  const identity = (await ctx.auth.getUserIdentity()) as Identity
  if (!identity) {
    notAuthenticated()
  }
  return { userId: identity.subject }
}

/**
 * A member of a verified organization.
 *
 * `orgId` comes from the VERIFIED claim, never from an argument. That is the
 * whole point: a handler that reads `args.orgId` is one missing check away
 * from cross-tenant reads, and the tier builders make that arg unreachable.
 *
 * If the JWT has no `orgId`, the `convex` Clerk template is missing
 * `"orgId": "{{org.id}}"` or the user has no active organization — the error
 * says so, because the silent version of this costs an afternoon.
 */
export async function requireOrgActor(
  ctx: AuthCtx,
  transport: CallerTransport
): Promise<OrgActor> {
  if (transport.serviceToken !== undefined) {
    requireServiceToken(transport.serviceToken)
    const userId = claimString(transport.actingUserId)
    const orgId = claimString(transport.actingOrgId)
    if (!(userId && orgId)) {
      notAuthorized('Server calls must name the acting user and organization.')
    }
    const orgRole = claimString(transport.actingOrgRole)
    return { userId, orgId, orgRole, isOrgAdmin: orgRole === 'org:admin' }
  }

  const identity = (await ctx.auth.getUserIdentity()) as Identity
  if (!identity) {
    notAuthenticated()
  }
  const orgId = claimString(identity.orgId)
  if (!orgId) {
    notAuthorized(
      'No active organization. Check that the "convex" Clerk JWT template includes orgId: {{org.id}}.'
    )
  }
  const orgRole = claimString(identity.orgRole)
  return {
    userId: identity.subject,
    orgId,
    orgRole,
    isOrgAdmin: orgRole === 'org:admin',
  }
}

/**
 * The organization control plane: billing, members, deleting the workspace.
 *
 * A service token alone is NEVER admin authority — it proves transport, not a
 * person. `requireOrgActor` already refuses a token that names nobody, and the
 * role it carries is the one the Next gateway read from that person's session.
 */
export async function requireOrgAdmin(
  ctx: AuthCtx,
  transport: CallerTransport
): Promise<OrgActor> {
  const actor = await requireOrgActor(ctx, transport)
  if (!actor.isOrgAdmin) {
    notAuthorized('This action requires an organization admin.')
  }
  return actor
}
