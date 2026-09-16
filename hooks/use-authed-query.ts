'use client'

import { type OptionalRestArgsOrSkip, useConvexAuth } from 'convex/react'
import type { FunctionReference } from 'convex/server'
// Cache-aware drop-ins for convex/react's hooks — see the
// ConvexQueryCacheProvider in components/convex-client-provider.tsx.
import { useQuery } from 'convex-helpers/react/cache/hooks'

/**
 * Auth-gated `useQuery` / `usePaginatedQuery`.
 *
 * WHY THIS EXISTS: `ConvexProviderWithAuth` attaches the Clerk JWT to the
 * socket ASYNCHRONOUSLY, after mount. For a brief window
 * `ctx.auth.getUserIdentity()` is still null — and every guarded function
 * hard-rejects an anonymous caller, so a query that fires on mount throws and
 * takes the React tree down with it. The crash is intermittent, it depends on
 * network timing, and it reproduces on exactly nobody's laptop.
 *
 * These hooks hold the query until Convex reports an authenticated identity,
 * then behave exactly like the originals. Once auth has attached they are a
 * no-op, so there is no reason not to use them.
 *
 * THE RULE: any reactive query whose Convex function is identity-scoped (built
 * with `authenticatedQuery` / `orgMemberQuery` / …) goes through these.
 * Genuinely public functions (`publicQuery`) keep the raw hook. Enforced by
 * tests/convex-client-auth-gating.test.ts.
 *
 * `'skip'` is preserved: a caller that already skips stays skipped.
 */
export function useAuthedQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  ...args: OptionalRestArgsOrSkip<Query>
): Query['_returnType'] | undefined {
  const { isAuthenticated } = useConvexAuth()
  const skipArgs = ['skip'] as unknown as OptionalRestArgsOrSkip<Query>
  return useQuery(query, ...(isAuthenticated ? args : skipArgs))
}
