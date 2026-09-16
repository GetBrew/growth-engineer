import { describe, expect, test } from 'vitest'
import {
  AUTH_ONLY_ROUTE_PATTERNS,
  PRIVATE_ROUTE_PATTERNS,
  PUBLIC_API_ROUTE_PATTERNS,
} from '@/lib/auth/routes'
import { hasBackslashInPath, markdownRewriteTarget } from '@/proxy'

/**
 * The route policy is the security boundary for every page, and the markdown
 * rewrite is how every agent reaches a file. Both are cheap to pin.
 */

describe('hasBackslashInPath', () => {
  test.each(['/openapi.json\\', '/openapi.json%5C', '/a%5cb', '/x\\y'])(
    'rejects %s',
    (pathname) => {
      expect(hasBackslashInPath(pathname)).toBe(true)
    }
  )

  test.each(['/', '/tools', '/api/health', '/sign-in/factor-one'])(
    'allows %s',
    (pathname) => {
      expect(hasBackslashInPath(pathname)).toBe(false)
    }
  )
})

describe('markdown file rewrite', () => {
  const get = (pathname: string, accept: string | null = null) =>
    markdownRewriteTarget({ pathname, method: 'GET', accept })

  test('a .md URL for a valid ref goes to the file handler', () => {
    expect(get('/tools/clay/clay.md')).toBe('/api/markdown/tools/clay/clay.md')
    expect(get('/workflows/brew/intent-to-meeting@3.md')).toBe(
      '/api/markdown/workflows/brew/intent-to-meeting@3.md'
    )
    expect(get('/companies/clay.md')).toBe('/api/markdown/companies/clay.md')
  })

  test('a .md URL that cannot name a file is left to 404 normally', () => {
    expect(get('/tools/clay.md')).toBeNull()
    expect(get('/README.md')).toBeNull()
    expect(get('/api/markdown/tools/clay/clay.md')).toBeNull()
  })

  test('Accept: text/markdown on a page serves the page’s file', () => {
    expect(get('/tools/clay/clay', 'text/markdown')).toBe(
      '/api/markdown/tools/clay/clay.md'
    )
    expect(
      get('/tools/clay/clay', 'text/html,application/xhtml+xml')
    ).toBeNull()
    // Only pages that HAVE a file negotiate; the home page stays HTML.
    expect(get('/', 'text/markdown')).toBeNull()
  })

  test('only GET and HEAD are files', () => {
    expect(
      markdownRewriteTarget({
        pathname: '/tools/clay/clay.md',
        method: 'POST',
        accept: null,
      })
    ).toBeNull()
  })
})

describe('route policy', () => {
  test('the whole /api tree is private by default', () => {
    expect(PRIVATE_ROUTE_PATTERNS).toContain('/api(.*)')
  })

  test('every public API carve-out is under /api', () => {
    for (const pattern of PUBLIC_API_ROUTE_PATTERNS) {
      expect(pattern.startsWith('/api')).toBe(true)
    }
  })

  test('the public API list stays short enough to audit by reading it', () => {
    expect(PUBLIC_API_ROUTE_PATTERNS.length).toBeLessThanOrEqual(5)
  })

  test('sign-in and sign-up are auth-only, never private', () => {
    for (const pattern of AUTH_ONLY_ROUTE_PATTERNS) {
      expect(PRIVATE_ROUTE_PATTERNS).not.toContain(pattern)
    }
  })
})
