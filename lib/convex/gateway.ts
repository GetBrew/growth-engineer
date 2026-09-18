import 'server-only'

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
 * Two transports, and the difference is not stylistic:
 *
 *   publicQuery  — nobody is acting. The catalog reads. No token, no identity;
 *                  the Convex function must be built with `publicQuery` too.
 *   system*      — a MACHINE is acting: a cron, a queue drain, a webhook. It
 *                  carries the service token and NO person, so a guard that
 *                  checks for an acting user can never mistake it for one.
 *
 * THE HUMAN TRANSPORT IS GONE WITH THE AUTH PROVIDER, not forgotten. It read
 * the session on the request and attached `actingUserId` / `actingOrgId`
 * alongside the service token, because the token proves only that a call came
 * from our deployment — it is never authority to act as a person. Convex still
 * enforces that pairing (`requireUserActor` in convex/shared/auth.ts refuses a
 * token that names nobody), so the tier is waiting, not weakened. Restoring it
 * is this file plus a provider; it is not a redesign.
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

function systemTransport(): Transport {
  return { serviceToken: serverEnv().CONVEX_SERVICE_TOKEN }
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

/** Write as a machine principal: a cron, a queue drain, a webhook. */
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
