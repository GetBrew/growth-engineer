import type { MetadataRoute } from 'next'
import { loadSitemapEntries } from '@/lib/catalog/discovery'
import { SITE_ORIGIN } from '@/lib/env'

/**
 * Every page, prerendered. The catalog knows each entity's `updated` date, so
 * the sitemap carries a real `lastModified` per page instead of the build
 * time — a crawler recrawls what changed, not everything.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return loadSitemapEntries().map((entry) => ({
    url: `${SITE_ORIGIN}${entry.path}`,
    ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))
}
