import { describe, expect, test } from 'vitest'
// The gate is a plain .mjs script — `allowJs` lets the test import it
// directly, so the functions under test are the ones CI actually runs.
import {
  declaredImportPaths,
  diffModules,
} from '../scripts/check-convex-codegen-fresh.mjs'

/**
 * The freshness gate is a regex over a generated file, which is exactly the
 * kind of thing that silently stops matching after a Convex upgrade changes
 * its codegen format — and then reports "in sync" forever.
 *
 * A guard is not done until it has FAILED: these cases prove it can still tell
 * drift from agreement.
 */

describe('convex codegen freshness', () => {
  test('reads the module list out of a generated api.d.ts', () => {
    const source = `
      import type * as tasks from "../tasks.js";
      import type * as users from "../users.js";
      import type * as shared_builders from "../shared/builders.js";
    `
    expect(declaredImportPaths(source)).toEqual([
      'shared/builders',
      'tasks',
      'users',
    ])
  })

  test('reports a module on disk that codegen has not declared', () => {
    expect(diffModules(['tasks', 'billing'], ['tasks'])).toEqual({
      missing: ['billing'],
      extra: [],
    })
  })

  test('reports a declared module that no longer exists', () => {
    expect(diffModules(['tasks'], ['tasks', 'legacy'])).toEqual({
      missing: [],
      extra: ['legacy'],
    })
  })

  test('is quiet when they agree', () => {
    expect(diffModules(['tasks'], ['tasks'])).toEqual({
      missing: [],
      extra: [],
    })
  })
})
