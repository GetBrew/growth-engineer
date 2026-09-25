import { describe, expect, test } from 'vitest'
import { hasBackslashInPath, markdownRewriteTarget } from '@/proxy'

/**
 * The markdown rewrite is how every agent reaches a file, and it runs for
 * every request — cheap to pin, expensive to get wrong.
 *
 * The route-policy tests that used to live here went with the auth provider:
 * every route is public now, so there is no policy left to assert. They come
 * back with the gate, in the pages and handlers that own it.
 */

describe('hasBackslashInPath', () => {
  test.each(['/openapi.json\\', '/openapi.json%5C', '/a%5cb', '/x\\y'])(
    'rejects %s',
    (pathname) => {
      expect(hasBackslashInPath(pathname)).toBe(true)
    }
  )

  test.each(['/', '/tools', '/llms.txt', '/workflows/brew/x'])(
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
    expect(get('/workflows/intent-to-meeting@3.md')).toBe(
      '/api/markdown/workflows/intent-to-meeting@3.md'
    )
    // A workflow key is one part; an owner segment is not a file.
    expect(get('/workflows/brew/intent-to-meeting.md')).toBeNull()
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
