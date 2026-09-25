import { describe, expect, test } from 'vitest'
import { readSourceFiles } from './helpers/source-files'

/**
 * The pure half of `lib/catalog/*` — the key grammar, the renderer, the
 * search grammar and the types — is imported by the proxy
 * (edge), by client components (the map) and by the build alike. A runtime
 * import of a Node built-in, `server-only` or the content reader would work
 * in one bundle and throw in another — at runtime, on the path nobody tested.
 *
 * The three modules that DO read the tree or the process are named here and
 * are the only ones allowed to.
 */

const SERVER_SIDE = new Set(['catalog.ts', 'loaders.ts', 'static-params.ts'])

const FORBIDDEN = [
  /^node:/, // Node built-ins are not in the edge or browser runtime
  /^server-only$/, // throws outside a React Server Component bundle
  /lib\/content\//, // the tree reader and the build: server-side by definition
  /^fs$|^path$/, // bare Node built-ins
]

// `import x from 'y'` and `import { x } from 'y'`, but not `import type`.
const RUNTIME_IMPORT = /^import\s+(?!type\b)[^'"]*from\s*['"]([^'"]+)['"]/gm

describe('lib/catalog purity', () => {
  const files = readSourceFiles('lib/catalog', { skipTests: true })

  test('there are catalog modules to check', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  test('no pure module has a runtime import of a server-side dependency', () => {
    const offenders: Array<string> = []
    for (const { relativePath, source } of files) {
      const name = relativePath.split('/').pop() ?? ''
      if (SERVER_SIDE.has(name)) {
        continue
      }
      for (const match of source.matchAll(RUNTIME_IMPORT)) {
        const specifier = match[1] ?? ''
        if (FORBIDDEN.some((pattern) => pattern.test(specifier))) {
          offenders.push(`${relativePath} imports ${specifier}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  test('the server-side modules say so', () => {
    for (const { relativePath, source } of files) {
      const name = relativePath.split('/').pop() ?? ''
      if (SERVER_SIDE.has(name)) {
        expect(source, relativePath).toMatch(
          /^import 'server-only'|from '\.\/catalog'/m
        )
      }
    }
  })
})
