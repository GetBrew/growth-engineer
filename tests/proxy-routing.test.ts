import { describe, expect, test } from 'vitest'
import {
  AUTH_ONLY_ROUTE_PATTERNS,
  PRIVATE_ROUTE_PATTERNS,
  PUBLIC_API_ROUTE_PATTERNS,
} from '@/lib/auth/routes'
import { hasBackslashInPath } from '@/proxy'

/**
 * The route policy is the security boundary for every page. These tests are
 * cheap; the failures they prevent are not.
 */

describe('hasBackslashInPath', () => {
  test.each(['/openapi.json\\', '/openapi.json%5C', '/a%5cb', '/x\\y'])(
    'rejects %s',
    (pathname) => {
      expect(hasBackslashInPath(pathname)).toBe(true)
    }
  )

  test.each(['/', '/dashboard', '/api/health', '/sign-in/factor-one'])(
    'allows %s',
    (pathname) => {
      expect(hasBackslashInPath(pathname)).toBe(false)
    }
  )
})

describe('route policy', () => {
  test('the whole /api tree is private by default', () => {
    // Default deny. A new route handler is protected the moment it exists —
    // the exceptions are the thing you have to write down.
    expect(PRIVATE_ROUTE_PATTERNS).toContain('/api(.*)')
  })

  test('every public API carve-out is under /api', () => {
    for (const pattern of PUBLIC_API_ROUTE_PATTERNS) {
      expect(pattern.startsWith('/api')).toBe(true)
    }
  })

  test('the public API list stays short enough to audit by reading it', () => {
    // Not a style rule: each entry is an endpoint reachable by anyone on the
    // internet with no session. A list that grows past this deserves a
    // conversation, not another line.
    expect(PUBLIC_API_ROUTE_PATTERNS.length).toBeLessThanOrEqual(5)
  })

  test('sign-in and sign-up are auth-only, never private', () => {
    // Listing them as private is a redirect loop: the gate bounces an
    // anonymous visitor to sign-in, which is itself gated.
    for (const pattern of AUTH_ONLY_ROUTE_PATTERNS) {
      expect(PRIVATE_ROUTE_PATTERNS).not.toContain(pattern)
    }
  })
})
