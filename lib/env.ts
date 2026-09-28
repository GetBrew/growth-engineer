import { z } from 'zod'

/**
 * Environment access, validated once, at the edge of the process. A missing
 * variable fails loudly and names itself instead of surfacing three layers
 * away as a 500. The catalog is built from the repository, so what ships to
 * the browser is `NEXT_PUBLIC_*` only. The one server secret is the copy
 * counter's store, read by `copyCounterEnv()` when called — never at import,
 * so no bundle carries it.
 */

/**
 * A variable that is unset and one set to `""` are the same thing, and every
 * deploy platform produces the second: a blank field in a dashboard, a `FOO=`
 * line copied out of `.env.example`. Zod sees `""` as PRESENT, so `.default()`
 * never applies and `z.url()` fails with "Invalid URL" — which sends you
 * hunting for a typo in a value that was never there. Blank means absent.
 */
function present<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema)
}

const clientSchema = z.object({
  /** Absolute origin of this deployment — `/llms.txt` and the files use it. */
  NEXT_PUBLIC_SITE_URL: present(z.url().default('http://localhost:3000')),
})

/**
 * On Vercel the deployment's hostname is known at build even when nobody set
 * the site URL — the project's production domain, or a preview's own URL —
 * so `/llms.txt` and `metadataBase` never print localhost from a deployment.
 * An explicit `NEXT_PUBLIC_SITE_URL` (a custom domain) still wins.
 */
function deployedOrigin(): string | undefined {
  const host =
    process.env.VERCEL_ENV === 'preview'
      ? process.env.VERCEL_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  return host ? `https://${host}` : undefined
}

// Next inlines `process.env.NEXT_PUBLIC_*` only where written out literally.
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || deployedOrigin(),
})

/** The origin without a trailing slash: what absolute URLs are built from. */
export const SITE_ORIGIN = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

const counterSchema = z.object({
  url: present(z.url().optional()),
  token: present(z.string().optional()),
  readToken: present(z.string().optional()),
})

/**
 * The copy counter's store: Upstash Redis over REST, under the names the
 * Vercel Marketplace integration sets (`KV_REST_API_*`) or Upstash's own
 * (`UPSTASH_REDIS_REST_*`). SERVER ONLY. Pages read with the read-only token
 * when there is one; only the count route writes. Optional on purpose — a
 * fresh clone, a fork and the test suite have no store — so `null` turns the
 * counter off and the pages hide every count rather than show one they lack.
 */
export function copyCounterEnv(): {
  url: string
  token: string
  readToken: string
} | null {
  const { url, token, readToken } = counterSchema.parse({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token:
      process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    readToken: process.env.KV_REST_API_READ_ONLY_TOKEN,
  })
  return url && token ? { url, token, readToken: readToken ?? token } : null
}
