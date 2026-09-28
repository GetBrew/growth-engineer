import 'server-only'
import { Redis } from '@upstash/redis'
import { cacheLife } from 'next/cache'
import { copyCounterEnv } from '@/lib/env'

/**
 * How many times each workflow's file was copied — the "Uses" on its page.
 * One Redis hash, workflow key → count, in the Upstash store from lib/env.ts.
 *
 * The site's one runtime datum, and it still never LOADS: the count is read
 * inside `'use cache'`, so it is prerendered into the page at build and
 * refreshed in the background (stale-while-revalidate) at most every
 * `REFRESH_SECONDS`. Every page is still served whole from the CDN.
 */

const COPIES = 'workflow:copies'

const REFRESH_SECONDS = 5 * 60

/** Past this, a count is left out of the page rather than hold it up. */
const TIMEOUT_MS = 2000

let client: Redis | null | undefined

function store(): Redis | null {
  if (client === undefined) {
    const env = copyCounterEnv()
    client = env
      ? new Redis({
          url: env.url,
          token: env.token,
          retry: { retries: 1 },
          signal: () => AbortSignal.timeout(TIMEOUT_MS),
          enableTelemetry: false,
        })
      : null
  }
  return client
}

/**
 * Every workflow's count, in one read shared by every page. `null` when the
 * store did not answer: the page hides the count then, and the next refresh
 * tries again.
 */
async function readCopyCounts(): Promise<Record<string, number> | null> {
  'use cache'
  cacheLife({
    stale: REFRESH_SECONDS,
    revalidate: REFRESH_SECONDS,
    expire: 30 * 24 * 60 * 60,
  })
  const redis = store()
  if (!redis) {
    return null
  }
  try {
    return (await redis.hgetall<Record<string, number>>(COPIES)) ?? {}
  } catch (error) {
    console.error('[copies] read failed:', error)
    return null
  }
}

/** Times `workflowKey` was copied; `null` when there is no count to show. */
export async function loadCopyCount(
  workflowKey: string
): Promise<number | null> {
  // No store, no cache: the page stays fully static and hides the count.
  if (!store()) {
    return null
  }
  const counts = await readCopyCounts()
  const count = counts ? Number(counts[workflowKey] ?? 0) : Number.NaN
  return Number.isSafeInteger(count) && count >= 0 ? count : null
}

/** Count one copy. `false` when there is no store to count it in. */
export async function recordCopy(workflowKey: string): Promise<boolean> {
  const redis = store()
  if (!redis) {
    return false
  }
  await redis.hincrby(COPIES, workflowKey, 1)
  return true
}
