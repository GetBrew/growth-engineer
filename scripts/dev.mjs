#!/usr/bin/env node
/**
 * `pnpm dev`: prune the Turbopack cache, start `next dev` with a heap cap, and
 * — the part `next dev` cannot do for itself — reap the exit flusher it leaves
 * behind.
 *
 * Next spawns a DETACHED telemetry flusher on every dev-server shutdown, even
 * with NEXT_TELEMETRY_DISABLED=1. The flusher loads next.config.ts to find
 * distDir; if your config imports anything that starts a long-lived service
 * (esbuild, a bundler plugin), the flusher never exits. Several hundred MB per
 * stopped dev server, parented to init, invisible in any task list you would
 * think to check. Stop four servers over an afternoon and the machine swaps.
 *
 * ALWAYS run the dev server through this wrapper, never `npx next dev`.
 */
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_NODE_OPTIONS = '--max-old-space-size=3072'
const REAP_WINDOW_MS = 8000
const REAP_POLL_MS = 400
const SIGKILL_AFTER_MS = 1500

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function listProcesses() {
  const result = spawnSync('ps', ['-axo', 'pid,ppid,command'], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0) {
    return []
  }
  return result.stdout
    .split('\n')
    .slice(1)
    .map((line) => line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map((match) => ({
      pid: Number(match[1]),
      ppid: Number(match[2]),
      command: match[3],
    }))
}

/**
 * This project's exit flushers plus their children. Attribution is
 * path-boundary safe so `/w/app` never claims `/w/app-2`'s flusher.
 */
function selectExitFlushers(rows, dir) {
  const flushers = rows.filter(
    (row) =>
      row.command.includes('detached-flush') &&
      (row.command.includes(`${dir} `) || row.command.endsWith(dir))
  )
  const flusherPids = new Set(flushers.map((row) => row.pid))
  const children = rows
    .filter((row) => flusherPids.has(row.ppid))
    .map((row) => row.pid)
  return [...flusherPids, ...children]
}

function signal(pid, name) {
  try {
    process.kill(pid, name)
  } catch {
    // already gone
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

async function reapExitFlushers(dir) {
  const deadline = Date.now() + REAP_WINDOW_MS
  let targets = []
  while (Date.now() < deadline) {
    targets = selectExitFlushers(listProcesses(), dir)
    if (targets.length > 0) {
      break
    }
    // biome-ignore lint/performance/noAwaitInLoops: a bounded poll, by design
    await sleep(REAP_POLL_MS)
  }
  if (targets.length === 0) {
    return []
  }
  for (const pid of targets) {
    signal(pid, 'SIGTERM')
  }
  await sleep(SIGKILL_AFTER_MS)
  for (const pid of targets) {
    if (isAlive(pid)) {
      signal(pid, 'SIGKILL')
    }
  }
  return targets
}

const projectDir = process.cwd()

const prune = spawnSync(
  process.execPath,
  [path.join(HERE, 'prune-next-dev-cache.mjs'), projectDir],
  { stdio: 'inherit' }
)
if (prune.status !== 0) {
  process.exit(prune.status ?? 1)
}

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const child = spawn(
  process.execPath,
  [nextBin, 'dev', '--turbopack', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS?.trim()
        ? process.env.NODE_OPTIONS
        : DEFAULT_NODE_OPTIONS,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  }
)

for (const name of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(name, () => {
    if (child.exitCode === null) {
      child.kill(name)
    }
  })
}

child.on('exit', async (code, exitSignal) => {
  const reaped = await reapExitFlushers(projectDir)
  if (reaped.length > 0) {
    console.error(`[dev] reaped Next exit flusher pid(s) ${reaped.join(', ')}`)
  }
  process.exit(code ?? (exitSignal ? 1 : 0))
})

child.on('error', (error) => {
  console.error(`[dev] failed to start next dev: ${error.message}`)
  process.exit(1)
})
