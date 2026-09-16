import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { REPO_ROOT, readSourceFiles } from './helpers/source-files'

/**
 * The tier builders (convex/shared/builders.ts) are only a guarantee while
 * every public Convex function actually uses one. These guards keep that true
 * as the app grows, and they are deliberately source scans: what they assert —
 * "did someone reach around the pattern" — no type can express.
 */

/**
 * Files allowed to construct raw `query` / `mutation` / `action`.
 * Adding to this list is how the pattern gets abandoned — do it with a reason.
 */
const RAW_BUILDER_ALLOWLIST = new Set(['convex/shared/builders.ts'])

/** Args the builders declare AND consume. A handler must never restate one. */
const CONSUMED_TRANSPORT_ARGS = [
  'serviceToken',
  'actingUserId',
  'actingOrgId',
  'actingOrgRole',
]

const RAW_BUILDER_IMPORT =
  /import\s*\{[^}]*\b(query|mutation|action)\b[^}]*\}\s*from\s*['"][^'"]*_generated\/server['"]/

const sourceFiles = readSourceFiles('convex', {
  skipDirectories: ['_generated'],
  skipTests: true,
})

describe('Convex function builders', () => {
  test('there are Convex modules to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(0)
  })

  test('no module imports the raw query/mutation/action builders', () => {
    const offenders = sourceFiles
      .filter(({ relativePath }) => !RAW_BUILDER_ALLOWLIST.has(relativePath))
      .filter(({ source }) => RAW_BUILDER_IMPORT.test(source))
      .map(({ relativePath }) => relativePath)

    expect(
      offenders,
      'These modules bypass the tier builders, so their authorization is a convention a reviewer has to verify by hand. Use a builder from convex/shared/builders.ts.'
    ).toEqual([])
  })

  test('no handler re-declares an arg its builder already consumed', () => {
    // A shadowing declaration hands the handler an UNVERIFIED value under a
    // name that reads exactly like the verified one — the worst failure mode,
    // because the code looks correct.
    const offenders: Array<string> = []
    for (const { relativePath, source } of sourceFiles) {
      if (RAW_BUILDER_ALLOWLIST.has(relativePath)) {
        continue
      }
      for (const argument of CONSUMED_TRANSPORT_ARGS) {
        if (new RegExp(`\\b${argument}:\\s*v\\.`).test(source)) {
          offenders.push(`${relativePath} re-declares "${argument}"`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  test('every builder consumes its transport args', () => {
    // `input` must return `args: {}` — that is what strips the caller's claim
    // before the handler runs. A builder that FORWARDS its args is a builder
    // whose handler can read an unverified orgId, which is the entire failure
    // this pattern exists to make unrepresentable.
    const builders = fs.readFileSync(
      path.join(REPO_ROOT, 'convex/shared/builders.ts'),
      'utf8'
    )
    const blocks = builders
      .split(/\nexport const /)
      .slice(1)
      .filter((block) => /custom(Query|Mutation|Action)\(/.test(block))

    expect(blocks.length).toBeGreaterThan(0)

    const offenders = blocks
      .filter(
        (block) =>
          !/args:\s*\{\s*\}/.test(block) ||
          /args:\s*args\b/.test(block) ||
          /\.\.\.args\b/.test(block)
      )
      .map((block) => block.slice(0, block.indexOf(' ')))

    expect(
      offenders,
      'These builders forward the caller-supplied transport args into the handler instead of consuming them.'
    ).toEqual([])
  })
})
