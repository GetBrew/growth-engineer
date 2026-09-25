import type { Metadata } from 'next'

/**
 * The metadata every page carries, built one way: a canonical URL, the
 * Open Graph facts (title, description, url — the image comes from the
 * route's `opengraph-image.tsx`), and for a page that IS a file, the
 * `text/markdown` alternate that tells an agent where the file is. Relative
 * paths: the root layout's `metadataBase` makes them absolute.
 *
 * PURE: no environment, no catalog. Twitter cards inherit from Open Graph.
 */
export function pageMetadata(input: {
  title: string
  description: string
  /** `/tools/clay/enrich-contacts` */
  path: string
  /** `/tools/clay/enrich-contacts.md` — only for pages that are a file. */
  file?: string
  type?: 'website' | 'article'
  /** Thin or navigational pages stay out of the index but keep their links. */
  noindex?: boolean
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
      ...(input.file ? { types: { 'text/markdown': input.file } } : {}),
    },
    openGraph: {
      type: input.type ?? 'website',
      url: input.path,
      title: input.title,
      description: input.description,
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
