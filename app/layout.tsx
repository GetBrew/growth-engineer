import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { VercelAnalytics } from '@/components/layout/vercel-analytics'
import { JsonLd } from '@/components/seo/json-ld'
import { SITE } from '@/lib/catalog/definitions'
import { clientEnv, SITE_ORIGIN } from '@/lib/env'
import { SITE_OPEN_GRAPH } from '@/lib/seo/metadata'
import { websiteJsonLd } from '@/lib/seo/structured-data'

import './globals.css'

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
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  applicationName: SITE.name,
  // Open Graph and Twitter facts every page shares; each page restates the
  // Open Graph ones and adds its own title, description, url and card
  // (lib/seo/metadata.ts).
  openGraph: { ...SITE_OPEN_GRAPH, type: 'website' },
  twitter: { card: 'summary_large_image' },
  // One robots tag for every engine, not a Google-only one: Bing reads the
  // snippet and image-preview limits too.
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      lang="en"
    >
      <body className="min-h-full">
        <JsonLd data={websiteJsonLd(SITE_ORIGIN)} />
        {/* The chrome lives HERE, not in a route-group layout: the root
            not-found boundary is serialized into every page's payload, and a
            not-found that drew its own navbar and footer shipped a second copy
            of both — and of the ⌘K index — with every page. */}
        <div className="flex min-h-svh flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <VercelAnalytics />
      </body>
    </html>
  )
}
