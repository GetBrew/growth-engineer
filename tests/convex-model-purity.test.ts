import { describe, expect, test } from 'vitest'
import { readSourceFiles } from './helpers/source-files'

/**
 * `convex/model/*` is PURE: the key grammar, the agent-level rules and the
 * markdown renderer are imported by the Convex functions AND by the Next app
 * (`@convex/model/*`), and bundled into both. A runtime import of the Convex
 * server library, a Node built-in or `server-only` would work in one bundle
 * and throw in the other — at runtime, on the path nobody tested.
 *
 * Type-only imports are fine: they vanish at build.
 */

const FORBIDDEN = [
  /^convex\//, // convex/server, convex/values — runtime Convex library
  /_generated\/server/, // function builders
  /\/shared\//, // guards and validators (they import convex/values)
  /^node:/, // Node built-ins are not in the Convex runtime
  /^server-only$/, // throws under the Convex bundler's export condition
]

// `import x from 'y'` and `import { x } from 'y'`, but not `import type`.
const RUNTIME_IMPORT = /^import\s+(?!type\b)[^'"]*from\s*['"]([^'"]+)['"]/gm

describe('convex/model purity', () => {
  const files = readSourceFiles('convex/model', { skipTests: true })

  test('there are model modules to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  test('no model module has a runtime import of a server-side dependency', () => {
    const offenders: Array<string> = []
    for (const { relativePath, source } of files) {
      for (const match of source.matchAll(RUNTIME_IMPORT)) {
        const specifier = match[1] ?? ''
        if (FORBIDDEN.some((pattern) => pattern.test(specifier))) {
          offenders.push(`${relativePath} imports ${specifier}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
