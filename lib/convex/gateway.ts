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
 * Three transports, and the difference is not stylistic:
 *
 *   publicQuery  — nobody is acting. The catalog reads. No token, no identity;
 *                  the Convex function must be built with `publicQuery` too.
 *   tenant*      — a VERIFIED HUMAN is acting, read from the Clerk session on
 *                  this request. Anything a signed-in user triggered.
 *   system*      — a MACHINE is acting: a webhook, a cron, a queue drain. It
 *                  carries the service token and NO person, so a guard that
 *                  checks for an acting user can never mistake it for one.
 *
 * The transport args are OPTIONAL at the wire (the browser path never sends
 * them), so a hand-threaded token that goes missing is invisible to `tsc` and
 * throws only at runtime. Attaching them here, by construction, is the point.
 */

type Transport = {
  serviceToken: string
  actingUserId?: string
  actingOrgId?: string
  actingOrgRole?: string
}

const convexOptions = { url: clientEnv.NEXT_PUBLIC_CONVEX_URL }

/** Read the public catalog. No identity is attached; none is needed. */
export async function publicQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query>
): Promise<FunctionReturnType<Query>> {
  return await fetchQuery(query, args, convexOptions)
}

async function tenantTransport(): Promise<Transport> {
  const { userId, orgId, orgRole } = await auth()
  return {
    serviceToken: serverEnv().CONVEX_SERVICE_TOKEN,
    ...(userId ? { actingUserId: userId } : {}),
    ...(orgId ? { actingOrgId: orgId } : {}),
    ...(orgRole ? { actingOrgRole: orgRole } : {}),
  }
}

function systemTransport(): Transport {
  return { serviceToken: serverEnv().CONVEX_SERVICE_TOKEN }
}

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

/** Write as a machine principal: a webhook, a cron, a queue drain. */
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
