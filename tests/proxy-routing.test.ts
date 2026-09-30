import {
  getRewrittenUrl,
  unstable_doesMiddlewareMatch,
} from 'next/experimental/testing/server'
import { type NextFetchEvent, NextRequest } from 'next/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { config, isMalformedPath, markdownRewriteTarget } from '@/proxy'

/**
 * The markdown rewrite is how every agent reaches a file, and the matcher
 * decides which requests pay for a proxy hop at all — cheap to pin,
 * expensive to get wrong. The AI-traffic report posts to a stubbed `fetch`.
 *
 * The route-policy tests that used to live here went with the auth provider:
 * every route is public now, so there is no policy left to assert. They come
 * back with the gate, in the pages and handlers that own it.
 */

describe('isMalformedPath', () => {
  test.each([
    '/openapi.json\\',
    '/openapi.json%5C',
    '/a%5cb',
    '/x\\y',
    '/workflows/%25zz',
    '/tools/%zz/x',
    '/companies/a%2',
  ])('rejects %s', (pathname) => {
    expect(isMalformedPath(pathname)).toBe(true)
  })

  test.each([
    '/',
    '/tools',
    '/llms.txt',
    '/workflows/brew/x',
    '/workflows/%E2%9C%93',
  ])('allows %s', (pathname) => {
    expect(isMalformedPath(pathname)).toBe(false)
  })
})

describe('markdown file rewrite', () => {
  const get = (pathname: string, accept: string | null = null) =>
    markdownRewriteTarget({ pathname, method: 'GET', accept })

  test('a .md URL for a valid ref goes to the file handler', () => {
    expect(get('/tools/clay/clay.md')).toBe('/api/markdown/tools/clay/clay.md')
    expect(get('/workflows/intent-to-meeting.md')).toBe(
      '/api/markdown/workflows/intent-to-meeting.md'
    )
    // Versions are gone: a pinned file is not a file.
    expect(get('/workflows/intent-to-meeting@3.md')).toBeNull()
    // A workflow key is one part; an owner segment is not a file.
    expect(get('/workflows/brew/intent-to-meeting.md')).toBeNull()
    expect(get('/companies/clay.md')).toBe('/api/markdown/companies/clay.md')
    expect(get('/tags/capability/enrich-contacts.md')).toBe(
      '/api/markdown/tags/capability/enrich-contacts.md'
    )
    expect(get('/tags/fit/icp.md')).toBeNull()
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

describe('what runs the proxy', () => {
  const runs = (url: string, headers: Record<string, string> = {}) =>
    unstable_doesMiddlewareMatch({ config, url, headers })

  test('a page view, a file and the index files', () => {
    for (const url of [
      '/',
      '/?q=outbound',
      '/workflows/funding-signal-outbound',
      '/tools/apollo/enrich-person',
      '/companies/apollo',
      '/tags/capability/enrich-contacts',
      '/add-a-workflow',
      '/tools/apollo/enrich-person.md',
      '/llms.txt',
      '/llms-full.txt',
    ]) {
      expect(runs(url), url).toBe(true)
    }
    expect(
      runs('/tools/apollo/enrich-person', { accept: 'text/markdown' })
    ).toBe(true)
    expect(runs('/workflows/%25zz')).toBe(true)
  })

  test('never a prefetch, a client navigation, an asset, the API or /mcp', () => {
    expect(runs('/', { rsc: '1', 'next-router-prefetch': '1' })).toBe(false)
    expect(runs('/workflows/funding-signal-outbound', { rsc: '1' })).toBe(false)
    for (const url of [
      '/_next/static/chunks/main.js',
      '/_next/image?url=%2Flogo.svg&w=64&q=75',
      '/_vercel/insights/view',
      '/icon.svg',
      '/apple-icon.png',
      '/logos/apollo.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/opengraph-image',
      '/workflows/funding-signal-outbound/opengraph-image',
      '/api/workflows/funding-signal-outbound/copies',
      '/mcp',
    ]) {
      expect(runs(url), url).toBe(false)
    }
  })
})

describe('the AI-traffic report', () => {
  const saved = process.env.NOTRA_GEO_TOKEN
  const sent: Array<{ url: string; init: RequestInit | undefined }> = []
  const pending: Array<Promise<unknown>> = []
  const event = {
    waitUntil: (promise: Promise<unknown>) => {
      pending.push(promise)
    },
  } as unknown as NextFetchEvent

  /** The proxy as a deploy with this token loads it. */
  async function proxyWith(token: string) {
    sent.length = 0
    pending.length = 0
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      sent.push({ url: String(input), init })
      return Promise.resolve(new Response(null, { status: 202 }))
    })
    process.env.NOTRA_GEO_TOKEN = token
    vi.resetModules()
    return (await import('@/proxy')).default
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    if (saved === undefined) {
      delete process.env.NOTRA_GEO_TOKEN
    } else {
      process.env.NOTRA_GEO_TOKEN = saved
    }
  })

  test('a page view is reported after the response, with the token', async () => {
    const proxy = await proxyWith('geo-test-token')
    const url = 'https://growth.engineer/workflows/funding-signal-outbound'
    const response = await proxy(
      new NextRequest(url, {
        headers: {
          'user-agent': 'GPTBot/1.2',
          referer: 'https://chatgpt.com/',
        },
      }),
      event
    )
    expect(response.headers.get('x-middleware-next')).toBe('1')
    // Handed to waitUntil, so the response never waits on Notra.
    expect(pending).toHaveLength(1)
    await Promise.all(pending)
    expect(sent).toHaveLength(1)
    expect(sent[0]?.url).toBe('https://app.usenotra.com/api/geo/ingest')
    expect(new Headers(sent[0]?.init?.headers).get('authorization')).toBe(
      'Bearer geo-test-token'
    )
    expect(JSON.parse(String(sent[0]?.init?.body))).toMatchObject({
      method: 'GET',
      url,
      userAgent: 'GPTBot/1.2',
      referer: 'https://chatgpt.com/',
    })
  })

  test('a file is reported and still rewritten; a malformed path is neither', async () => {
    const proxy = await proxyWith('geo-test-token')
    const file = await proxy(
      new NextRequest(
        'https://growth.engineer/workflows/funding-signal-outbound.md'
      ),
      event
    )
    expect(getRewrittenUrl(file)).toBe(
      'https://growth.engineer/api/markdown/workflows/funding-signal-outbound.md'
    )
    const malformed = await proxy(
      new NextRequest('https://growth.engineer/workflows/%25zz'),
      event
    )
    expect(malformed.status).toBe(404)
    await Promise.all(pending)
    expect(sent.map((post) => JSON.parse(String(post.init?.body)).url)).toEqual(
      ['https://growth.engineer/workflows/funding-signal-outbound.md']
    )
  })

  test('without a token nothing is sent', async () => {
    const proxy = await proxyWith('')
    await proxy(new NextRequest('https://growth.engineer/'), event)
    await Promise.all(pending)
    expect(sent).toHaveLength(0)
  })
})
