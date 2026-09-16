#!/usr/bin/env node
/**
 * Is `convex/_generated/api.d.ts` in sync with the modules in `convex/`?
 *
 * THE FAILURE THIS CATCHES: you add, rename or delete a Convex function module
 * and forget to commit the regenerated `_generated`. Nothing goes red — the
 * deploy regenerates codegen first, so production is fine — but every
 * teammate's editor and every typecheck reads a stale `api.d.ts` in which your
 * module does not exist. The error they get names their file, not yours.
 *
 * Pure filesystem, zero dependencies, no credentials, ~0.1s: it recomputes the
 * module list the Convex bundler would emit and diffs it against the
 * `import type * as X from "../X.js"` lines actually in the committed file.
 *
 *   node scripts/check-convex-codegen-fresh.mjs [--advisory]
 *
 * `--advisory` prints and exits 0 (how it is wired into `pnpm check`, so it can
 * never wall unrelated work); the bare form exits 1 on drift and is the CI gate.
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ENTRY_POINT_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']

function* walkFiles(dir) {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    const child = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // A subdirectory with its own convex.config.ts is a nested component;
      // the bundler skips it wholesale.
      if (fs.existsSync(path.join(child, 'convex.config.ts'))) {
        continue
      }
      yield* walkFiles(child)
    } else if (entry.isFile()) {
      yield child
    }
  }
}

/** The modules codegen would emit, as posix paths without extension. */
export function entryPointImportPaths(convexDir) {
  const kept = []
  for (const filePath of walkFiles(convexDir)) {
    const relative = path.relative(convexDir, filePath)
    const base = path.basename(filePath)
    const extension = path.extname(base)

    // Mirror of the bundler's skip rules, in its order:
    if (relative.startsWith('_generated')) {
      continue
    }
    if (base.startsWith('.')) {
      continue
    }
    if (base.startsWith('#')) {
      continue
    }
    // More than one dot in the basename: *.test.ts, *.config.ts, *.d.ts. The
    // bundler never ships these, so codegen never declares them.
    if (base.split('.').length > 2) {
      continue
    }
    if (!ENTRY_POINT_EXTENSIONS.includes(extension)) {
      continue
    }
    if (base === 'schema.ts' || base === 'schema.js') {
      continue
    }
    if (base === 'auth.config.ts' || base === 'auth.config.js') {
      continue
    }
    // An empty module (types or comments only) declares no functions.
    if (fs.readFileSync(filePath, 'utf8').trim().length === 0) {
      continue
    }

    kept.push(relative.slice(0, -extension.length).split(path.sep).join('/'))
  }
  return kept.sort()
}

/** The modules the committed api.d.ts declares. */
export function declaredImportPaths(apiDtsSource) {
  const declared = []
  const pattern = /import type \* as \w+ from ['"]\.\.\/(.+?)\.js['"]/g
  let match = pattern.exec(apiDtsSource)
  while (match !== null) {
    declared.push(match[1])
    match = pattern.exec(apiDtsSource)
  }
  return declared.sort()
}

export function diffModules(onDisk, declared) {
  const declaredSet = new Set(declared)
  const diskSet = new Set(onDisk)
  return {
    missing: onDisk.filter((name) => !declaredSet.has(name)),
    extra: declared.filter((name) => !diskSet.has(name)),
  }
}

function main() {
  const isAdvisory = process.argv.includes('--advisory')
  const convexDir = path.resolve(process.cwd(), 'convex')
  const apiDtsPath = path.join(convexDir, '_generated', 'api.d.ts')

  if (!fs.existsSync(apiDtsPath)) {
    // Codegen has simply never run in this checkout. Never wall on that.
    console.warn(
      'convex-codegen-freshness: convex/_generated/api.d.ts not found; run `npx convex dev` once. Skipping.'
    )
    return 0
  }

  const onDisk = entryPointImportPaths(convexDir)
  const declared = declaredImportPaths(fs.readFileSync(apiDtsPath, 'utf8'))
  const { missing, extra } = diffModules(onDisk, declared)

  if (missing.length === 0 && extra.length === 0) {
    console.log(
      `convex codegen fresh: ${declared.length} modules in sync with convex/.`
    )
    return 0
  }

  const report = [
    missing.length > 0
      ? `  on disk but NOT in api.d.ts: ${missing.join(', ')}`
      : null,
    extra.length > 0
      ? `  in api.d.ts but NOT on disk: ${extra.join(', ')}`
      : null,
    '  Run `npx convex codegen` and commit convex/_generated.',
  ]
    .filter(Boolean)
    .join('\n')

  if (isAdvisory) {
    console.warn(`\n⚠️  convex-codegen-freshness (advisory)\n${report}\n`)
    return 0
  }
  console.error(`\nconvex-codegen-freshness: DRIFT\n${report}\n`)
  return 1
}

// Library when imported by a test, CLI when run directly.
if (
  process.argv[1] &&
  import.meta.url.endsWith(path.basename(process.argv[1]))
) {
  process.exit(main())
}
