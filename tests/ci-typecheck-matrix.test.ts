import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { REPO_ROOT } from './helpers/source-files'

/**
 * The CI typecheck matrix must list every program `scripts/typecheck.mjs`
 * knows about.
 *
 * Drift here is silent and expensive: add a sixth program, forget the matrix
 * leg, and CI goes on reporting green for code it never compiles. Nothing
 * fails — that is the problem.
 */

function readProgramsFromScript(): Array<string> {
  const source = fs.readFileSync(
    path.join(REPO_ROOT, 'scripts/typecheck.mjs'),
    'utf8'
  )
  const block = source.slice(
    source.indexOf('const PROGRAMS = {'),
    source.indexOf('\n}\n', source.indexOf('const PROGRAMS = {'))
  )
  expect(block, 'could not find PROGRAMS in scripts/typecheck.mjs').toBeTruthy()
  return [...block.matchAll(/^\s+'?([\w:]+)'?:\s*\{/gm)].map(
    (match) => match[1] as string
  )
}

function readProgramsFromWorkflow(): Array<string> {
  const source = fs.readFileSync(
    path.join(REPO_ROOT, '.github/workflows/ci.yml'),
    'utf8'
  )
  const matrix = source.match(/^\s+program:\s*\[(.+)\]\s*$/m)
  expect(matrix, 'could not find the `program:` matrix in ci.yml').toBeTruthy()
  return (matrix?.[1] ?? '')
    .split(',')
    .map((name) => name.trim().replace(/^['"]|['"]$/g, ''))
}

describe('CI typecheck matrix', () => {
  test('covers every program the typecheck script defines', () => {
    const fromScript = readProgramsFromScript()
    expect(fromScript.length).toBeGreaterThan(1)
    expect([...readProgramsFromWorkflow()].sort()).toEqual(
      [...fromScript].sort()
    )
  })
})
