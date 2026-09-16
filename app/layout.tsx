import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

/**
 * The root layout is a SHELL. Under `cacheComponents: true` it is prerendered
 * once and reused by every route, so nothing here may read request-time data
 * (`auth()`, `cookies()`, `headers()`, `searchParams`) outside a `<Suspense>`
 * boundary — a dynamic read up here un-prerenders the entire application.
 *
 * `<ClerkProvider>` and `<ConvexClientProvider>` are client components that
 * only set up context, so they are shell-safe. Anything that READS the session
 * belongs further down, behind its own boundary.
 */

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Starter',
    template: '%s · Starter',
  },
  description: 'Next.js + Convex + Clerk starter.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `suppressHydrationWarning` is required by next-themes: it writes the
    // theme class onto <html> before React hydrates, which is what prevents a
    // flash of the wrong theme. The attribute scopes the exemption to this one
    // element.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh antialiased`}
      >
        <ClerkProvider afterSignOutUrl="/">
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
