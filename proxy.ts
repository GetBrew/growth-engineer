import { type NextRequest, NextResponse } from 'next/server'
import { filePathToRef } from '@/lib/catalog/keys'

/**
 * `proxy.ts` is what Next 16 calls the file that used to be `middleware.ts`.
 * It runs before every matched request.
 *
 * ONE JOB TODAY: serve the markdown files. `/tools/clay/clay.md`, and any page
 * requested with `Accept: text/markdown`, is rewritten to the file handler —
 * agents fetch files with no session, and on Vercel the proxy runs ahead of
 * the CDN cache, which does not key on `Vary`, so agents must be diverted
 * before cached HTML is served.
 *
 * THERE IS NO AUTH GATE HERE, because there is no auth provider: every route
 * is public and the catalog is meant to be. If auth ever arrives it does not
 * come back to this file either: path matching can diverge from how Next
 * routes a request, so protection belongs IN the protected thing — each
 * handler authenticating itself, each private page checking in the page.
 */

const PERCENT_ENCODED_BACKSLASH = /%5c/i

/**
 * A backslash is not a legal path character and no route has one, but Next
 * routes `/x.json%5C` far enough to throw. Answer 404 here instead of minting
 * 500s for scanners. Exported for tests/proxy-routing.test.ts.
 */
export function hasBackslashInPath(pathname: string): boolean {
  return pathname.includes('\\') || PERCENT_ENCODED_BACKSLASH.test(pathname)
}

/**
 * Where a request for a markdown file is rewritten, or null when it is not
 * one. Only paths that name a valid ref qualify, so the handler never looks
 * up a path that cannot be a file. Exported for the proxy test.
 */
export function markdownRewriteTarget(input: {
  pathname: string
  method: string
  accept: string | null
}): string | null {
  if (input.method !== 'GET' && input.method !== 'HEAD') {
    return null
  }
  if (input.pathname.endsWith('.md')) {
    return filePathToRef(input.pathname)
      ? `/api/markdown${input.pathname}`
      : null
  }
  if (
    input.accept?.includes('text/markdown') &&
    filePathToRef(`${input.pathname}.md`)
  ) {
    return `/api/markdown${input.pathname}.md`
  }
  return null
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (hasBackslashInPath(pathname)) {
    return new NextResponse(null, { status: 404 })
  }

  const markdownTarget = markdownRewriteTarget({
    pathname,
    method: req.method,
    accept: req.headers.get('accept'),
  })
  if (markdownTarget) {
    const response = NextResponse.rewrite(new URL(markdownTarget, req.url))
    response.headers.append('Vary', 'Accept')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next internals and static assets. `.md` is deliberately NOT in this
    // list — file requests must reach the rewrite above. `.txt` is, so
    // `/llms.txt` is served by its route handler with no proxy hop at all.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|txt|xml|webmanifest|wasm|mp4|pdf)).*)',
    '/(api|trpc)(.*)',
  ],
}
