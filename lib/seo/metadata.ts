import type { Metadata } from 'next'
import { OG_SIZE } from '@/components/seo/og-card'
import { SITE } from '@/lib/catalog/definitions'

/**
 * The site's own card (app/opengraph-image.tsx). A page's `openGraph` REPLACES
 * its parent's rather than merging, so a page without a card of its own must
 * name this one or it ships no image at all.
 */
const SITE_CARD = {
  url: '/opengraph-image',
  ...OG_SIZE,
  alt: SITE.tagline,
}

/**
 * The Open Graph facts every page shares. For the same reason as the card,
 * the root layout's copy reaches only a page with no `openGraph` of its own,
 * so every page restates them here.
 */
export const SITE_OPEN_GRAPH = { siteName: SITE.name, locale: 'en_US' }

/**
 * The metadata every page carries, built one way: a canonical URL, the
 * Open Graph facts (the site's name and locale; title, description, url — the
 * image comes from the route's `opengraph-image.tsx`, or the site's card for a
 * page without one), and for a page that IS a file, the `text/markdown`
 * alternate that tells an agent where the file is. Relative paths: the root
 * layout's `metadataBase` makes them absolute.
 *
 * PURE: no environment, no catalog. Twitter cards inherit from Open Graph.
 */
export function pageMetadata(input: {
  title: string
  description: string
  /** `/tools/apollo/enrich-person` */
  path: string
  /**
   * `/tools/apollo/enrich-person.md` — only for pages that are a file. Those
   * pages draw their own card, so they do not get the site's.
   */
  file?: string
  type?: 'website' | 'article'
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
      ...(input.file ? { types: { 'text/markdown': input.file } } : {}),
    },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      type: input.type ?? 'website',
      url: input.path,
      title: input.title,
      description: input.description,
      ...(input.file ? {} : { images: [SITE_CARD] }),
    },
  }
}
