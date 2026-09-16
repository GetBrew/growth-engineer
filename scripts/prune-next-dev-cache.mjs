#!/usr/bin/env node
/**
 * `.next/dev/cache` is disposable, and it grows without bound — a few broad dev
 * sessions write gigabytes of it per checkout. With several worktrees that is
 * tens of GB of disk doing nothing, and it is the first thing to reclaim when a
 * build starts failing for "no space".
 *
 * Called by `pnpm dev` before the server starts (never while one is running:
 * deleting a cache out from under a live Turbopack session is how you get
 * inexplicable module-not-found errors), and available as `pnpm cache:prune`.
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const MAX_BYTES = 3 * 1024 * 1024 * 1024

function directorySize(dir) {
  let total = 0
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return 0
  }
  for (const entry of entries) {
    const child = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      total += directorySize(child)
    } else {
      try {
        total += fs.statSync(child).size
      } catch {
        // raced with the compiler; ignore
      }
    }
  }
  return total
}

const projectDir = process.argv[2] ?? process.cwd()
const cacheDir = path.join(projectDir, '.next', 'dev', 'cache')

if (!fs.existsSync(cacheDir)) {
  process.exit(0)
}

const size = directorySize(cacheDir)
if (size > MAX_BYTES) {
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.error(
    `[cache:prune] removed ${(size / 1024 ** 3).toFixed(1)} GB of Turbopack dev cache`
  )
}
