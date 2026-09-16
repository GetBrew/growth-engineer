import { describe, expect, test } from 'vitest'
import { readSourceFiles } from './helpers/source-files'

/**
 * `internalMutation` / `internalQuery` / `internalAction` are unreachable from
 * a client, so they carry no identity guard — which is exactly why they must
 * stay confined to the modules whose job is machine work. A public function
 * that quietly became internal, or an internal one that grew a public twin,
 * is the drift this pins.
 */

const ALLOWED = new Set(['convex/seed/run.ts', 'convex/documents.ts'])

const INTERNAL_BUILDER_IMPORT =
  /import\s*\{[^}]*\binternal(Query|Mutation|Action)\b[^}]*\}\s*from\s*['"][^'"]*_generated\/server['"]/

describe('internal function builders', () => {
  test('appear only in the render pipeline and the seed', () => {
    const offenders = readSourceFiles('convex', {
      skipDirectories: ['_generated'],
      skipTests: true,
    })
      .filter(({ relativePath }) => !ALLOWED.has(relativePath))
      .filter(({ source }) => INTERNAL_BUILDER_IMPORT.test(source))
      .map(({ relativePath }) => relativePath)
    expect(
      offenders,
      'Internal builders belong to the render pipeline and the seed. A public read uses a tier builder; a machine write from Next uses serviceMutation.'
    ).toEqual([])
  })

  test('the allowlist is not stale', () => {
    const present = new Set(
      readSourceFiles('convex', {
        skipDirectories: ['_generated'],
        skipTests: true,
      })
        .filter(({ source }) => INTERNAL_BUILDER_IMPORT.test(source))
        .map(({ relativePath }) => relativePath)
    )
    for (const path of ALLOWED) {
      expect(
        present.has(path),
        `${path} no longer uses an internal builder — remove it from ALLOWED`
      ).toBe(true)
    }
  })
})
