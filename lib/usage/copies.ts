import 'server-only'
import { Redis } from '@upstash/redis'
import { cacheLife } from 'next/cache'
import { connection } from 'next/server'
import { cache } from 'react'
import { copyCounterEnv } from '@/lib/env'
import type { CopyStats, CopyStatsByKey } from '@/lib/usage/stats'
import { visitorId } from '@/lib/usage/visitor'

/**
 * How many times each workflow's file was copied — the "Uses" on its page and
 * the Popular order on the home page. Upstash Redis, from lib/env.ts:
 *
 *   workflow:copies               hash  key → copies, all time
 *   workflow:copies:<YYYY-MM-DD>  hash  key → copies that UTC day, kept 60 days
 *   workflow:copied:<key>:<id>    one visitor's copy of one workflow, for 24h
 *
 * A copy counts ONCE per visitor per workflow per 24 hours: the last key is
 * claimed with `SET NX` before anything is added, so a spammed Copy button,
 * a reload or a script in a loop from one address adds one, not one each.
 *
 * A production deployment owns those keys; a preview writes `preview:…` and
 * development `development:…`, so testing a Copy never moves a real count.
 *
 * The pages stay STATIC: each count sits in a `<Suspense>` hole, read at
 * request time (`connection()`) through a time-based `'use cache'`, so the
 * store is asked at most once a minute and the prerendered shell never waits
 * on it. A page with no store has no hole at all.
 */

function namespace(): string {
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview:'
  }
  return process.env.NODE_ENV === 'production' ? '' : 'development:'
}

const TOTALS = `${namespace()}workflow:copies`
const DAY_BUCKET_TTL_SECONDS = 60 * 24 * 60 * 60
/** Two weeks of days: this week's copies, and last week's to compare. */
const DAYS_READ = 14
/** Past this, the store is skipped for this read rather than hold a page. */
const TIMEOUT_MS = 2000

function dayKey(daysAgo: number, now: number): string {
  const day = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
  return `${TOTALS}:${day.toISOString().slice(0, 10)}`
}

const COPIED = `${namespace()}workflow:copied`
const REPEAT_WINDOW_SECONDS = 24 * 60 * 60

type Clients = { reader: Redis; writer: Redis; secret: string }
let clients: Clients | null | undefined

function client(url: string, token: string): Redis {
  return new Redis({
    url,
    token,
    retry: { retries: 1 },
    signal: () => AbortSignal.timeout(TIMEOUT_MS),
    enableTelemetry: false,
  })
}

function store(): Clients | null {
  if (clients === undefined) {
    const env = copyCounterEnv()
    clients = env
      ? {
          reader: client(env.url, env.readToken),
          writer: client(env.url, env.token),
          secret: env.token,
        }
      : null
  }
  return clients
}

/** Whether this deployment counts copies. Known at build: no store, no hole. */
export function hasCopyCounter(): boolean {
  return store() !== null
}

function toCount(value: unknown): number {
  const count = Number(value ?? 0)
  return Number.isSafeInteger(count) && count > 0 ? count : 0
}

/**
 * Every workflow's stats in one round trip: the totals and 14 day buckets.
 * `null` when the store did not answer — the counts stay hidden until the
 * next read tries again.
 */
async function readCopyStats(): Promise<CopyStatsByKey | null> {
  'use cache'
  cacheLife({ stale: 60, revalidate: 60, expire: 24 * 60 * 60 })
  const reader = store()?.reader
  if (!reader) {
    return null
  }
  const now = Date.now()
  const pipeline = reader.pipeline()
  pipeline.hgetall(TOTALS)
  for (let day = 0; day < DAYS_READ; day += 1) {
    pipeline.hgetall(dayKey(day, now))
  }
  try {
    const [totals, ...days] =
      await pipeline.exec<Array<Record<string, unknown> | null>>()
    const stats: Record<string, CopyStats> = {}
    const entry = (key: string): CopyStats => {
      stats[key] ??= { total: 0, week: 0, lastWeek: 0 }
      return stats[key]
    }
    for (const [key, value] of Object.entries(totals ?? {})) {
      entry(key).total = toCount(value)
    }
    days.forEach((bucket, day) => {
      for (const [key, value] of Object.entries(bucket ?? {})) {
        entry(key)[day < 7 ? 'week' : 'lastWeek'] += toCount(value)
      }
    })
    return stats
  } catch (error) {
    console.error('[copies] read failed:', error)
    return null
  }
}

/**
 * Every workflow's copy stats, read at REQUEST time: await it inside a
 * `<Suspense>` boundary, or hand the promise to a client component that reads
 * it inside one. `null` with no store, or when it did not answer. One read
 * per request, however many holes ask.
 */
export const loadCopyStats = cache(async (): Promise<CopyStatsByKey | null> => {
  if (!hasCopyCounter()) {
    return null
  }
  await connection()
  return await readCopyStats()
})

/**
 * Count one copy by the visitor making this request: `counted` the first time
 * in 24 hours, `repeat` after that (nothing is added), `off` with no store.
 */
export async function recordCopy(
  workflowKey: string,
  headers: Headers
): Promise<'counted' | 'repeat' | 'off'> {
  const current = store()
  if (!current) {
    return 'off'
  }
  const { writer, secret } = current
  const claimed = await writer.set(
    `${COPIED}:${workflowKey}:${visitorId(headers, secret)}`,
    1,
    { nx: true, ex: REPEAT_WINDOW_SECONDS }
  )
  if (claimed === null) {
    return 'repeat'
  }
  const today = dayKey(0, Date.now())
  await writer
    .pipeline()
    .hincrby(TOTALS, workflowKey, 1)
    .hincrby(today, workflowKey, 1)
    .expire(today, DAY_BUCKET_TTL_SECONDS)
    .exec()
  return 'counted'
}
