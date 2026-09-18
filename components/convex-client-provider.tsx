'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache/provider'
import type { ReactNode } from 'react'
import { clientEnv } from '@/lib/env'

/**
 * The Convex websocket. UNAUTHENTICATED: there is no auth provider yet, so no
 * browser call carries an identity and every guarded Convex function refuses
 * by default. That is the safe direction — the catalog is public and reads
 * need nobody.
 *
 * When auth returns, this becomes `ConvexProviderWithAuth` with a `useAuth`
 * adapter that asks the provider for a Convex-audience token explicitly, by
 * template name, rather than letting the provider pick a default token whose
 * claims depend on unrelated dashboard state.
 */
const convex = new ConvexReactClient(clientEnv.NEXT_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
})

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {/*
        Keep subscriptions warm for five minutes after their last subscriber
        unmounts. Navigating back to a page you just left then re-paints from
        the live cache instead of cold-resubscribing over the socket — the
        difference between instant and a visible ~0.5s blank.
      */}
      <ConvexQueryCacheProvider expiration={300_000}>
        {children}
      </ConvexQueryCacheProvider>
    </ConvexProvider>
  )
}
