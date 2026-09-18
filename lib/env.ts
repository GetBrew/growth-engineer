import { z } from 'zod'

/**
 * Environment access, validated once, at the edge of the process. A missing
 * variable fails loudly and names itself instead of surfacing three layers
 * away as a 500. `clientEnv` ships to the browser (`NEXT_PUBLIC_*` only);
 * `serverEnv()` is read lazily so importing this module from a client
 * component cannot pull a secret into the bundle.
 *
 * NO AUTH PROVIDER YET. Every read is public and no human signs in, so the
 * only server secret is the service token. When auth returns, its keys are
 * added here first — a provider whose configuration is optional is a provider
 * that is silently off in production.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  /** Absolute origin of this deployment — `/llms.txt` and the files use it. */
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  /** logos.context.dev public client id; absent = local logos only. */
  NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID: z.string().optional(),
})

// Next inlines `process.env.NEXT_PUBLIC_*` only where written out literally.
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID:
    process.env.NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID,
})

const serverSchema = z.object({
  // The shared secret every server -> Convex call and the revalidate route
  // carry. It proves the call came from OUR server; it is transport authority,
  // never a person's.
  CONVEX_SERVICE_TOKEN: z.string().min(16),
})

let cachedServerEnv: z.infer<typeof serverSchema> | null = null

/** Server-only. Throws, once, naming the variable that is missing. */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (cachedServerEnv) {
    return cachedServerEnv
  }
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')
    throw new Error(
      `Invalid server environment: ${missing}. Copy .env.example to .env.local and fill it in.`
    )
  }
  cachedServerEnv = parsed.data
  return cachedServerEnv
}
