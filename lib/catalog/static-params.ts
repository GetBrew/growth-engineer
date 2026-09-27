import 'server-only'

import { getCatalog } from './catalog'
import { parseRef, refToFilePath } from './keys'

/**
 * Every path the build prerenders, straight from the catalog. Each list is
 * non-empty as long as the tree has one entity of its kind — an empty catalog
 * fails the build on purpose (Cache Components requires at least one result
 * from every `generateStaticParams`).
 */

export function companyParams(): Array<{ handle: string }> {
  return [...getCatalog().companies.keys()].map((handle) => ({ handle }))
}

export function toolParams(): Array<{ handle: string; name: string }> {
  return [...getCatalog().tools.keys()].map((key) => {
    const [handle = '', name = ''] = key.split('/')
    return { handle, name }
  })
}

export function workflowParams(): Array<{ name: string }> {
  return [...getCatalog().workflows.keys()].map((name) => ({ name }))
}

/** `/tools/<handle>` shortcuts: every company and every old company key. */
export function toolShortcutParams(): Array<{ handle: string }> {
  const catalog = getCatalog()
  const handles = [...catalog.companies.keys()]
  for (const [ref, key] of catalog.aliases) {
    if (ref.startsWith('company:') && catalog.companies.has(key)) {
      handles.push(ref.slice('company:'.length))
    }
  }
  return handles.map((handle) => ({ handle }))
}

/**
 * Every `.md` file: each document, and each alias path (which the handler
 * answers with a 308).
 */
export function markdownFileParams(): Array<{ path: Array<string> }> {
  const catalog = getCatalog()
  const paths: Array<string> = []
  for (const document of catalog.documents.values()) {
    const ref = parseRef(document.ref)
    if (!ref) {
      continue
    }
    paths.push(refToFilePath(ref))
  }
  for (const oldRef of catalog.aliases.keys()) {
    const ref = parseRef(oldRef)
    if (ref) {
      paths.push(refToFilePath(ref))
    }
  }
  return paths.map((filePath) => ({ path: filePath.slice(1).split('/') }))
}
