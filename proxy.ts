import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  AFTER_SIGN_IN_PATH,
  AUTH_ONLY_ROUTE_PATTERNS,
  PRIVATE_ROUTE_PATTERNS,
  PUBLIC_API_ROUTE_PATTERNS,
} from './lib/auth/routes'

/**
 * `proxy.ts` is what Next 16 calls the file that used to be `middleware.ts`.
 * It runs before every matched request; the route policy it enforces lives in
 * ONE place (`lib/auth/routes.ts`) so the gate and any client-side "does this
 * page need Clerk?" check cannot drift apart.
 */
// Spread into a mutable array: the policy arrays are `as const` so the tests
// can assert on their literal contents, and Clerk's matcher takes a mutable one.
const isPrivateRoute = createRouteMatcher([...PRIVATE_ROUTE_PATTERNS])
const isAuthOnlyRoute = createRouteMatcher([...AUTH_ONLY_ROUTE_PATTERNS])
const isPublicApiRoute = createRouteMatcher([...PUBLIC_API_ROUTE_PATTERNS])

/**
 * True when the request path carries a backslash, raw or percent-encoded.
 *
 * A backslash is not a legal path character (RFC 3986) and no route has one,
 * but Next routes `/openapi.json%5C` far enough to ask the pages resolver for
 * a module named after the mangled path — which throws. The result is a 500,
 * in your error budget, for a URL you do not serve. Only handlers whose path
 * contains a DOT reach that resolver, which is why `/something.json%5C` 500s
 * while `/pricing%5C` does not.
 *
 * Checked in BOTH spellings: `nextUrl.pathname` preserves the `%5C` escape,
 * and a raw `\` survives from some clients.
 *
 * Exported for tests/proxy-routing.test.ts.
 */
const PERCENT_ENCODED_BACKSLASH = /%5c/i

export function hasBackslashInPath(pathname: string): boolean {
  return pathname.includes('\\') || PERCENT_ENCODED_BACKSLASH.test(pathname)
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Answer a malformed path here rather than letting Next fall through to a
  // module lookup that throws. 404 is the honest status: there is no such
  // route, and scanners asking for one should not mint 500s.
  if (hasBackslashInPath(pathname)) {
    return new NextResponse(null, { status: 404 })
  }

  // Public API routes carry no session by construction (a webhook, a probe).
  // Returning before `auth()` keeps a Clerk outage from taking them down too.
  if (isPublicApiRoute(req)) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  // Forward the pathname so server layouts can make routing decisions without
  // reaching for `headers()` themselves.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  if (userId && isAuthOnlyRoute(req)) {
    return NextResponse.redirect(new URL(AFTER_SIGN_IN_PATH, req.url))
  }

  if (isPrivateRoute(req) && !userId) {
    // `auth.protect()` redirects a browser to sign-in and 404s an API request
    // — the correct answer differs per caller, and Clerk already knows which
    // one this is.
    await auth.protect()
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    // Skip Next internals and anything with a file extension — a static asset
    // never needs an auth decision, and paying for one on every image is how
    // a proxy becomes the slowest part of a page.
    //
    // When you add a microfrontend, its path prefix is excluded HERE as well
    // (see docs/microfrontends.md) — the child app runs its own proxy.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|txt|xml|webmanifest|wasm)).*)',
    '/(api|trpc)(.*)',
  ],
}
