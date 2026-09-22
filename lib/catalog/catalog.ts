import 'server-only'

import { buildCatalog, type Catalog } from '@/lib/content/build-catalog'
import { readContentTree } from '@/lib/content/read-tree'

/**
 * THE catalog, built from the source tree once per process and reused by
 * every page, route handler and static-params function. The read is
 * SYNCHRONOUS on purpose: inside Next's prerender a value that resolves
 * without real I/O keeps a route static, so every catalog page and both
 * `.md` handlers prerender at build with no `'use cache'` and no
 * `connection()`.
 *
 * In development the tree is re-read when its fingerprint (file count and
 * newest mtime) changes, because content files are not modules and Turbopack
 * cannot hot-reload them. In production the catalog is frozen per deployment,
 * which is the point: a deploy IS the publish.
 */

let cached: { fingerprint: string; catalog: Catalog } | null = null

export function getCatalog(): Catalog {
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (cached && !isDevelopment) {
    return cached.catalog
  }
  const tree = readContentTree()
  if (cached?.fingerprint === tree.fingerprint) {
    return cached.catalog
  }
  const catalog = buildCatalog(tree.files, {
    logos: tree.logos,
    problems: tree.problems,
  })
  cached = { fingerprint: tree.fingerprint, catalog }
  return catalog
}
