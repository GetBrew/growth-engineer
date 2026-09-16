/**
 * THE route policy. One list, read by the proxy (server) and by any client
 * code that needs to know whether a page requires a session.
 *
 * Two lists exist because they answer different questions:
 *
 *   PRIVATE  — needs a signed-in user. The proxy redirects to sign-in.
 *   AUTH_ONLY — the sign-in / sign-up pages themselves. A signed-in visitor
 *               is bounced to the app instead of being shown a login form.
 *
 * DEFAULT DENY IS THE OTHER HALF. `PRIVATE_ROUTE_PATTERNS` below matches
 * `/(app)`-group routes by their PUBLIC path plus the whole `/api` tree, so a
 * new page under a protected prefix is protected the moment it exists — you do
 * not have to remember to add it. A new PUBLIC page is the thing you add
 * deliberately.
 */

/** Routes that require a signed-in user. */
export const PRIVATE_ROUTE_PATTERNS = [
  '/dashboard(.*)',
  '/settings(.*)',
  // Every API route except the ones explicitly listed as public below. A route
  // handler that forgets its own auth check is still refused here.
  '/api(.*)',
] as const

/** Sign-in / sign-up: a signed-in visitor has no business here. */
export const AUTH_ONLY_ROUTE_PATTERNS = [
  '/sign-in(.*)',
  '/sign-up(.*)',
] as const

/**
 * Carve-outs from `/api(.*)`.
 *
 * Keep this list SHORT and keep each entry's reason next to it. Anything here
 * is reachable by anyone on the internet with no session, so it must
 * authenticate itself (a webhook signature, a bearer token) or be genuinely
 * public.
 */
export const PUBLIC_API_ROUTE_PATTERNS = [
  // Liveness probe: no data, no identity.
  '/api/health',
  // Clerk -> app webhooks verify an Svix signature inside the route; a session
  // cookie is never present on them.
  '/api/webhooks(.*)',
] as const

/** Where a signed-in user lands: after sign-in, and from `/` in the proxy. */
export const AFTER_SIGN_IN_PATH = '/dashboard'
