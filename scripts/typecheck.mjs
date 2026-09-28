#!/usr/bin/env node
/**
 * `pnpm tsc [program…]` — typecheck one program, or all of them.
 *
 * THE SPLIT IS THE POINT. `next build` and the fast check should compile
 * runtime code only, not the thousands of test and script files no runtime
 * depends on. So the repo has two TypeScript programs, and this is the ONE
 * place that knows their names — the CI matrix passes a program name straight
 * through, and there is no per-program package script to keep in sync.
 *
 *   pnpm tsc            # both, in order
 *   pnpm tsc app        # just the app program
 *   pnpm tsc app tests
 *
 * `next typegen` runs at most ONCE per invocation, and only when a selected
 * program actually consumes its output.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

/** program name → tsconfig, and whether it reads Next's generated types. */
const PROGRAMS = {
  app: { project: 'tsconfig.json', needsTypegen: true },
  tests: { project: 'tests/tsconfig.json', needsTypegen: true },
}

const bin = (name) => path.join(process.cwd(), 'node_modules', '.bin', name)

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.error) {
    console.error(`[tsc] failed to run ${command}: ${result.error.message}`)
    process.exit(1)
  }
  return result.status ?? 1
}

const requested = process.argv.slice(2)
const unknown = requested.filter((name) => !(name in PROGRAMS))
if (unknown.length > 0) {
  console.error(
    `[tsc] unknown program(s): ${unknown.join(', ')}. Known: ${Object.keys(PROGRAMS).join(', ')}`
  )
  process.exit(2)
}

const selected = requested.length > 0 ? requested : Object.keys(PROGRAMS)

if (selected.some((name) => PROGRAMS[name].needsTypegen)) {
  const status = run(bin('next'), ['typegen'])
  if (status !== 0) {
    process.exit(status)
  }
}

for (const name of selected) {
  console.error(`[tsc] ${name} (${PROGRAMS[name].project})`)
  const status = run(bin('tsc'), ['-p', PROGRAMS[name].project, '--noEmit'])
  if (status !== 0) {
    process.exit(status)
  }
}
