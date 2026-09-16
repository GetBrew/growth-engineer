'use client'

import { useAuth } from '@clerk/nextjs'
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache/provider'
import { type ReactNode, useMemo } from 'react'
import { clientEnv } from '@/lib/env'

/**
 * The Convex websocket, authenticated with Clerk.
 *
 * WHY NOT `ConvexProviderWithClerk`: the stock adapter picks the DEFAULT Clerk
 * session token when that token happens to advertise `aud === "convex"`, and
 * the named template otherwise. Our authorization claims (`orgId`, `orgRole`)
 * live only in the named template, so which token gets chosen must not depend
 * on unrelated Clerk dashboard state. This asks for the reviewed template
 * explicitly, every time.
 */
const CONVEX_JWT_TEMPLATE = 'convex' as const

const convex = new ConvexReactClient(clientEnv.NEXT_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
})

function useNamedConvexAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const fetchAccessToken = useMemo(
    () =>
      async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        try {
          return await getToken({
            template: CONVEX_JWT_TEMPLATE,
            skipCache: forceRefreshToken,
          })
        } catch {
          // Convex reads a null token as "unauthenticated", which keeps every
          // guarded query fail-closed while a Clerk refresh or a
          // misconfiguration heals. Throwing here would crash the tree instead.
          return null
        }
      },
    [getToken]
  )

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken,
    }),
    [fetchAccessToken, isLoaded, isSignedIn]
  )
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useNamedConvexAuth}>
      {/*
        Keep subscriptions warm for five minutes after their last subscriber
        unmounts. Navigating back to a page you just left then re-paints from
        the live cache instead of cold-resubscribing over the socket — the
        difference between instant and a visible ~0.5s blank.
        Consumed through the cache-aware hooks in hooks/use-authed-query.ts.
      */}
      <ConvexQueryCacheProvider expiration={300_000}>
        {children}
      </ConvexQueryCacheProvider>
    </ConvexProviderWithAuth>
  )
}
