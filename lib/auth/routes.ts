/**
 * THE route policy. One list, read by the proxy (server) and by anything that
 * needs to know whether a page requires a session.
 *
 * growth.engineer is a public catalog: agents read everything without signing
 * in. The signed-in surface is small and grows with the publish flow.
 *
 *   PRIVATE   needs a signed-in user; the proxy redirects to sign-in.
 *   AUTH_ONLY the sign-in / sign-up pages; a signed-in visitor is bounced home.
 *
 * DEFAULT DENY IS THE OTHER HALF. `/api(.*)` is private, so a new route
 * handler is protected the moment it exists; a PUBLIC API route is the thing
 * you add deliberately, below, with its reason.
 */

export const PRIVATE_ROUTE_PATTERNS = ['/submit(.*)', '/api(.*)'] as const

export const AUTH_ONLY_ROUTE_PATTERNS = [
  '/sign-in(.*)',
  '/sign-up(.*)',
] as const

/**
 * Carve-outs from `/api(.*)`. Every entry is reachable by anyone on the
 * internet with no session, so it authenticates itself or is genuinely public.
 */
export const PUBLIC_API_ROUTE_PATTERNS = [
  // Liveness probe: no data, no identity.
  '/api/health',
  // Clerk -> app webhooks verify a Svix signature inside the route.
  '/api/webhooks(.*)',
  // The markdown files. Agents fetch these with no session, by design.
  '/api/markdown(.*)',
  // Cache purge; gated by the service token inside the route.
  '/api/revalidate',
] as const

/** Where a signed-in visitor of /sign-in lands. The catalog is the product. */
export const AFTER_SIGN_IN_PATH = '/'
