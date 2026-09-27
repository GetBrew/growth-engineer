import { type NextRequest, NextResponse } from 'next/server'
import { filePathToRef, filePathToTagKey } from '@/lib/catalog/keys'

/**
 * `proxy.ts` is what Next 16 calls the file that used to be `middleware.ts`.
 * It runs before every matched request.
 *
 * ONE JOB: serve the markdown files. `/tools/apollo/enrich-person.md`, and a page
 * requested with `Accept: text/markdown`, is rewritten to the file handler —
 * agents fetch files with no session, and on Vercel the proxy runs ahead of
 * the CDN cache, which does not key on `Vary`, so agents must be diverted
 * before cached HTML is served. The matcher below admits only those
 * requests, so an ordinary page view never runs this file.
 *
 * THERE IS NO AUTH GATE HERE, because there is no auth provider: every route
 * is public and the catalog is meant to be. If auth ever arrives it does not
 * come back to this file either: path matching can diverge from how Next
 * routes a request, so protection belongs IN the protected thing — each
 * handler authenticating itself, each private page checking in the page.
 */

const PERCENT_ENCODED_BACKSLASH = /%5c/i
/** `%25` decodes to a bare `%`; `%zz` is no escape at all. */
const BAD_PERCENT = /%25|%(?![0-9a-f]{2})/i

/**
 * Paths no route has but Next routes far enough to throw on: a backslash
 * (`/x.json%5C`), or a `%` a param decodes badly (`/workflows/%25zz`,
 * `/tools/%zz/x`). No key holds either. Answer 404 here instead of minting
 * 500s for scanners. Exported for tests/proxy-routing.test.ts.
 */
export function isMalformedPath(pathname: string): boolean {
  return (
    pathname.includes('\\') ||
    PERCENT_ENCODED_BACKSLASH.test(pathname) ||
    BAD_PERCENT.test(pathname)
  )
}

/** A path that names a file: a valid ref's, or a tag's. */
function isFilePath(pathname: string): boolean {
  return Boolean(filePathToRef(pathname) ?? filePathToTagKey(pathname))
}

/**
 * Where a request for a markdown file is rewritten, or null when it is not
 * one. Only paths that name a file qualify, so the handler never looks up a
 * path that cannot be a file. Exported for the proxy test.
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
    return isFilePath(input.pathname) ? `/api/markdown${input.pathname}` : null
  }
  if (
    input.accept?.includes('text/markdown') &&
    isFilePath(`${input.pathname}.md`)
  ) {
    return `/api/markdown${input.pathname}.md`
  }
  return null
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isMalformedPath(pathname)) {
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

/**
 * ONLY the requests this file has a job for. Every other request — every page
 * view, every Link prefetch, every asset — is served straight from the static
 * build with no proxy hop at all.
 */
export const config = {
  matcher: [
    // A file: `/tools/apollo/enrich-person.md`.
    '/(.+\\.md)',
    // A page asked for as markdown (an agent, `curl -H 'Accept: text/markdown'`).
    {
      source: '/((?!_next|api).*)',
      has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
    },
    // A path with a backslash or a bad `%`, answered 404 before Next can
    // route it.
    '/(.*(?:%5[cC]|%25|%(?![0-9a-fA-F]{2})|\\\\).*)',
  ],
}
