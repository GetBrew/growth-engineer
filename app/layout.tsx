import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { JsonLd } from '@/components/seo/json-ld'
import { SITE } from '@/lib/catalog/definitions'
import { clientEnv, SITE_ORIGIN } from '@/lib/env'
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
  // Open Graph and Twitter facts every page shares; each page adds its own
  // title, description, url and card (lib/seo/metadata.ts).
  openGraph: { siteName: SITE.name, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
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
        {children}
      </body>
    </html>
  )
}
