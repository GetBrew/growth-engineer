#!/usr/bin/env node
/**
 * ONE heavy command at a time, machine-wide.
 *
 * WHY: `tsc`, `next build`, the full Vitest run and `knip` each load the whole
 * project — several GB of resident memory apiece. Two of them at once on a
 * laptop is swap; three is a kernel OOM kill that looks, from the terminal, like
 * a mysterious test failure. That is easy to avoid with one developer and one
 * checkout, and impossible to avoid by hand once you have a few git worktrees
 * and a coding agent running checks in each of them.
 *
 * The lock is a file in the OS temp directory keyed by the GIT COMMON DIR, so
 * every worktree of one repository shares it while unrelated repositories do
 * not contend. A waiter QUEUES rather than failing: a timeout here means the
 * queue was too long, never that your code is broken, and the message names the
 * holder so you know what to wait for.
 *
 *   node scripts/heavy-lock.mjs <label> -- <command…>
 *
 * Set HEAVY_LOCK_DISABLE=1 to bypass it (CI runners are already isolated — one
 * job, one machine — so there is nothing to serialize against there).
 */
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const WAIT_TIMEOUT_MS = Number(process.env.HEAVY_LOCK_TIMEOUT_MS ?? 30 * 60_000)
const POLL_MS = 500
const STALE_AFTER_MS = 2 * 60 * 60_000

function gitCommonDir() {
  const result = spawnSync('git', ['rev-parse', '--git-common-dir'], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    return process.cwd()
  }
  return path.resolve(process.cwd(), result.stdout.trim())
}

function lockPath() {
  const key = createHash('sha256')
    .update(gitCommonDir())
    .digest('hex')
    .slice(0, 16)
  return path.join(os.tmpdir(), `heavy-lock-${key}.json`)
}

function readHolder(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}

/** A holder is stale when its process is gone, or it has held the lock absurdly long. */
function isStale(holder) {
  if (!holder?.pid) {
    return true
  }
  if (!isAlive(holder.pid)) {
    return true
  }
  return Date.now() - (holder.startedAt ?? 0) > STALE_AFTER_MS
}

function tryAcquire(file, label) {
  try {
    // `wx` is the atomic part: two processes racing here, exactly one wins.
    const handle = fs.openSync(file, 'wx')
    fs.writeFileSync(
      handle,
      JSON.stringify({
        label,
        pid: process.pid,
        cwd: process.cwd(),
        startedAt: Date.now(),
      })
    )
    fs.closeSync(handle)
    return true
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error
    }
    const holder = readHolder(file)
    if (isStale(holder)) {
      // Reclaim: the holder died without releasing. Deleting and retrying is
      // safe because the retry goes through the same atomic `wx` open.
      try {
        fs.unlinkSync(file)
      } catch {
        // someone else reclaimed it first
      }
      return tryAcquire(file, label)
    }
    return false
  }
}

async function acquire(file, label) {
  const deadline = Date.now() + WAIT_TIMEOUT_MS
  let announced = false
  while (Date.now() < deadline) {
    if (tryAcquire(file, label)) {
      return
    }
    if (!announced) {
      const holder = readHolder(file)
      console.error(
        `[heavy-lock] waiting for "${holder?.label ?? 'unknown'}" (pid ${holder?.pid ?? '?'}${holder?.cwd ? ` in ${holder.cwd}` : ''})…`
      )
      announced = true
    }
    // biome-ignore lint/performance/noAwaitInLoops: a bounded queue poll, by design
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
  const holder = readHolder(file)
  throw new Error(
    `[heavy-lock] timed out after ${Math.round(WAIT_TIMEOUT_MS / 60_000)} min waiting for "${holder?.label ?? 'unknown'}" (pid ${holder?.pid ?? '?'}). This is a QUEUE timeout, not a check failure.`
  )
}

function release(file) {
  const holder = readHolder(file)
  if (holder?.pid === process.pid) {
    try {
      fs.unlinkSync(file)
    } catch {
      // already gone
    }
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const separator = argv.indexOf('--')
  if (separator === -1 || separator === 0) {
    console.error('usage: heavy-lock.mjs <label> -- <command…>')
    process.exit(2)
  }
  const label = argv.slice(0, separator).join(' ')
  const [command, ...commandArgs] = argv.slice(separator + 1)
  if (!command) {
    console.error('usage: heavy-lock.mjs <label> -- <command…>')
    process.exit(2)
  }

  const file = lockPath()
  const bypass = process.env.HEAVY_LOCK_DISABLE === '1' || process.env.CI

  if (!bypass) {
    await acquire(file, label)
    const cleanup = () => release(file)
    process.on('exit', cleanup)
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
      process.on(signal, () => {
        cleanup()
        process.exit(1)
      })
    }
  }

  const child = spawn(command, commandArgs, { stdio: 'inherit', shell: false })
  child.on('exit', (code, signal) => {
    if (!bypass) {
      release(file)
    }
    process.exit(code ?? (signal ? 1 : 0))
  })
  child.on('error', (error) => {
    if (!bypass) {
      release(file)
    }
    console.error(`[heavy-lock] failed to start ${command}: ${error.message}`)
    process.exit(1)
  })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
