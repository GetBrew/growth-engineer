import { createRequire } from 'node:module'
import { PHASE_PRODUCTION_SERVER } from 'next/constants'
import { describe, expect, test } from 'vitest'
import loadConfig from '@/next.config'

/**
 * The redirects in next.config.ts run before the filesystem, so a pattern
 * that is too wide silently swallows real routes. Matched with Next's own
 * path-to-regexp, exactly as the router matches them.
 */

const require = createRequire(import.meta.url)
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
  pathToRegexp: (path: string) => RegExp
}

async function redirectFor(path: string) {
  const config = await loadConfig(PHASE_PRODUCTION_SERVER)
  const redirects = (await config.redirects?.()) ?? []
  return redirects.find((redirect) => pathToRegexp(redirect.source).test(path))
}

describe('redirects', () => {
  test.each([
    '/workflows/funding-signal-outbound/opengraph-image-1528ns',
    '/tools/apollo/enrich-person/opengraph-image-yje5dh',
    '/companies/apollo/opengraph-image-abc123',
    '/workflows/funding-signal-outbound',
    '/tools/apollo/enrich-person.md',
  ])('%s is served, not redirected', async (path) => {
    expect(await redirectFor(path)).toBeUndefined()
  })

  test('an old /workflows/<owner>/<name> link still lands on the workflow', async () => {
    expect((await redirectFor('/workflows/jdoe/some-flow'))?.destination).toBe(
      '/workflows/:name'
    )
  })
})
