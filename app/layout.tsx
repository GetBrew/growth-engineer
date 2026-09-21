import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { clientEnv } from '@/lib/env'

import './globals.css'

/**
 * The root layout is a SHELL. Under `cacheComponents: true` it is prerendered
 * once and reused by every route, so nothing here reads request-time data.
 * Both providers only set up context; anything that READS the session lives
 * further down, behind its own Suspense boundary.
 */

// Season (variable). TRIAL license — see README before this repo goes public.
const season = localFont({
  src: '../public/fonts/season/SeasonCollectionVF-TRIAL.woff2',
  variable: '--font-season',
  display: 'swap',
  weight: '100 900',
})

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'growth.engineer',
    template: '%s · growth.engineer',
  },
  description:
    'The agent-friendly marketplace for go-to-market tools and workflows. Every tool and workflow is one markdown file any agent can run.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${season.variable} h-full antialiased`} lang="en">
      <body className="min-h-full">
        <ClerkProvider afterSignOutUrl="/">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
