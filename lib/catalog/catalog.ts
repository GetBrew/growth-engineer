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

type Built = {
  fingerprint: string
  catalog: Catalog
  /** Each source file as written, by its path from the repo root. */
  sources: ReadonlyMap<string, string>
}

let cached: Built | null = null

function build(): Built {
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (cached && !isDevelopment) {
    return cached
  }
  const tree = readContentTree()
  if (cached?.fingerprint === tree.fingerprint) {
    return cached
  }
  const catalog = buildCatalog(tree.files, {
    logos: tree.logos,
    problems: tree.problems,
  })
  cached = {
    fingerprint: tree.fingerprint,
    catalog,
    sources: new Map(tree.files.map((file) => [file.path, file.source])),
  }
  return cached
}

export function getCatalog(): Catalog {
  return build().catalog
}

/**
 * A source file exactly as it sits in the repository — `workflows/<name>.md`,
 * `companies/clay/company.md` — for pages that show one as an example.
 */
export function getSourceFile(path: string): string | undefined {
  return build().sources.get(path)
}
