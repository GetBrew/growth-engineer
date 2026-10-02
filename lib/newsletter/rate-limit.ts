import 'server-only'
import { Redis } from '@upstash/redis'
import { copyCounterEnv } from '@/lib/env'
import { visitorId } from '@/lib/usage/visitor'

/**
 * How often one visitor may try to sign up. The sign-up is a server action,
 * which anyone can call without the form, and each new address costs a Brew
 * deliverability check — so a script is stopped after a few tries an hour.
 * The count lives in the copy counter's store, under the same keyed hash of
 * the visitor's address (the raw address is never stored), and each
 * environment keeps its own keys, as the counter does. With no store — a
 * fresh clone, a fork — sign-ups are not limited rather than refused.
 */

const TRIES = 5
const WINDOW_SECONDS = 60 * 60
const TIMEOUT_MS = 2000

function namespace(): string {
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview:'
  }
  return process.env.NODE_ENV === 'production' ? '' : 'development:'
}

/** Count this try; `false` once the visitor is past the hour's allowance. */
export async function allowSignUp(headers: Headers): Promise<boolean> {
  const env = copyCounterEnv()
  if (!env) {
    return true
  }
  const redis = new Redis({
    url: env.url,
    token: env.token,
    retry: { retries: 1 },
    signal: () => AbortSignal.timeout(TIMEOUT_MS),
    enableTelemetry: false,
  })
  const key = `${namespace()}newsletter:tries:${visitorId(headers, env.token)}`
  try {
    const [tries] = await redis
      .pipeline()
      .incr(key)
      .expire(key, WINDOW_SECONDS, 'NX')
      .exec<[number, number]>()
    return tries <= TRIES
  } catch {
    // The store did not answer: a sign-up is worth more than the limit.
    return true
  }
}
