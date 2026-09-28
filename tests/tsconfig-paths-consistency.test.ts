import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

/**
 * `tsconfig.base.json` owns the path aliases, but TypeScript never merges
 * `paths` across `extends` and Biome reads the NEAREST tsconfig.json without
 * following `extends` at all. So every program carries a copy — and a copy is
 * a thing that drifts.
 *
 * Drift here is nasty: one tool resolves `@/lib/x` to a different file than
 * another, so a module can typecheck and lint cleanly while the bundler loads
 * something else. This test is what makes the duplication safe.
 */

const ROOT = path.resolve(__dirname, '..')

function readJsonc(relativePath: string): Record<string, unknown> {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  // Line comments only — that is all these files use.
  return JSON.parse(source.replace(/^\s*\/\/.*$/gm, ''))
}

function pathsOf(relativePath: string): Record<string, Array<string>> {
  const config = readJsonc(relativePath) as {
    compilerOptions?: { paths?: Record<string, Array<string>> }
  }
  return config.compilerOptions?.paths ?? {}
}

/** Programs with a `baseUrl` of `..` spell the same target without `./`. */
function normalize(
  paths: Record<string, Array<string>>
): Record<string, Array<string>> {
  return Object.fromEntries(
    Object.entries(paths).map(([alias, targets]) => [
      alias,
      targets.map((target) => target.replace(/^\.\//, '')),
    ])
  )
}

const MIRRORS = ['tsconfig.json', 'tests/tsconfig.json'] as const

describe('tsconfig path maps', () => {
  const base = normalize(pathsOf('tsconfig.base.json'))

  test('the base map is not empty', () => {
    expect(Object.keys(base).length).toBeGreaterThan(0)
  })

  test.each(MIRRORS)('%s mirrors every base alias', (mirror) => {
    const mirrored = normalize(pathsOf(mirror))
    for (const [alias, targets] of Object.entries(base)) {
      expect(
        mirrored[alias],
        `${mirror} is missing the "${alias}" alias — add it, or alias resolution differs between TypeScript and Biome.`
      ).toEqual(targets)
    }
  })
})
