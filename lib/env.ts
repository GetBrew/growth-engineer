import { z } from 'zod'

/**
 * Environment access, validated once, at the edge of the process.
 *
 * WHY NOT `process.env.FOO!` AT THE CALL SITE: a missing variable then becomes
 * `undefined` flowing into a fetch URL or an SDK constructor, and the failure
 * surfaces three layers away as a 500 with an unrelated message. Parsing here
 * turns it into one loud error naming the variable.
 *
 * The two objects are separate ON PURPOSE. Anything under `clientEnv` is
 * `NEXT_PUBLIC_*` and ships to the browser; `serverEnv` is read lazily so that
 * importing this module from a client component cannot pull a secret into the
 * bundle, and so a build that only needs the public half does not fail on a
 * server-only variable.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
})

/**
 * Next inlines `process.env.NEXT_PUBLIC_*` at build time only where it is
 * written out literally — a dynamic lookup like `process.env[key]` is NOT
 * replaced and reads `undefined` in the browser. Hence the literal object.
 */
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  // The shared secret every server -> Convex call carries. Convex verifies it
  // before trusting the caller's claim about WHO is acting.
  CONVEX_SERVICE_TOKEN: z.string().min(16),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
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
