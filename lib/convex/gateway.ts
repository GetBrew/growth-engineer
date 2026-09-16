import 'server-only'

import { auth } from '@clerk/nextjs/server'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from 'convex/server'
import { clientEnv, serverEnv } from '@/lib/env'

/**
 * THE server-side Convex transport. Everything on the server calls Convex
 * through here; `convex/nextjs` is banned everywhere else by Biome's
 * `noRestrictedImports` (this file is the one override).
 *
 * WHY A GATEWAY AND NOT JUST `fetchQuery`: the Convex guards need to know who
 * is acting, and on the server that identity has to be attached by hand. Doing
 * it at the call site means every new route is one forgotten field away from
 * an unauthenticated call — and because the transport args are OPTIONAL at the
 * wire (they must be: the browser path doesn't send them), a missing one is
 * invisible to `tsc` and throws only at runtime, in production, on the path
 * nobody tested.
 *
 * Two transports, and the difference is not stylistic:
 *
 *   tenant*  — a VERIFIED HUMAN is acting. Identity is read from the Clerk
 *              session on this request. Use it for anything a user triggered.
 *   system*  — a MACHINE is acting: cron, webhook, queue drain. It carries the
 *              service token and NO person, so it can never be mistaken for
 *              one by a guard that checks for an acting user.
 */

type Transport = {
  serviceToken: string
  actingUserId?: string
  actingOrgId?: string
  actingOrgRole?: string
}

async function tenantTransport(): Promise<Transport> {
  const { userId, orgId, orgRole } = await auth()
  const { CONVEX_SERVICE_TOKEN } = serverEnv()
  return {
    serviceToken: CONVEX_SERVICE_TOKEN,
    ...(userId ? { actingUserId: userId } : {}),
    ...(orgId ? { actingOrgId: orgId } : {}),
    ...(orgRole ? { actingOrgRole: orgRole } : {}),
  }
}

function systemTransport(): Transport {
  return { serviceToken: serverEnv().CONVEX_SERVICE_TOKEN }
}

const convexOptions = { url: clientEnv.NEXT_PUBLIC_CONVEX_URL }

/** Read as the signed-in user of THIS request. */
export async function tenantQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: Omit<FunctionArgs<Query>, keyof Transport>
): Promise<FunctionReturnType<Query>> {
  return await fetchQuery(
    query,
    { ...args, ...(await tenantTransport()) } as FunctionArgs<Query>,
    convexOptions
  )
}

/** Write as the signed-in user of THIS request. */
export async function tenantMutation<
  Mutation extends FunctionReference<'mutation'>,
>(
  mutation: Mutation,
  args: Omit<FunctionArgs<Mutation>, keyof Transport>
): Promise<FunctionReturnType<Mutation>> {
  return await fetchMutation(
    mutation,
    { ...args, ...(await tenantTransport()) } as FunctionArgs<Mutation>,
    convexOptions
  )
}

/** Read as a machine principal. No person is acting. */
export async function systemQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: Omit<FunctionArgs<Query>, keyof Transport>
): Promise<FunctionReturnType<Query>> {
  return await fetchQuery(
    query,
    { ...args, ...systemTransport() } as FunctionArgs<Query>,
    convexOptions
  )
}

/** Write as a machine principal: cron, webhook, queue drain. */
export async function systemMutation<
  Mutation extends FunctionReference<'mutation'>,
>(
  mutation: Mutation,
  args: Omit<FunctionArgs<Mutation>, keyof Transport>
): Promise<FunctionReturnType<Mutation>> {
  return await fetchMutation(
    mutation,
    { ...args, ...systemTransport() } as FunctionArgs<Mutation>,
    convexOptions
  )
}
