import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { clientEnv } from '@/lib/env'

import './globals.css'

/**
 * The root layout is a SHELL. Under `cacheComponents: true` it is prerendered
 * once and reused by every route, so nothing here reads request-time data.
 * The Convex provider only sets up context; anything that READS request-time
 * data lives further down, behind its own Suspense boundary.
 */

// Geist (SIL OFL): the one open family for text; Geist Mono for code.
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
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
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      lang="en"
    >
      <body className="min-h-full">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
