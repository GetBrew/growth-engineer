import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from 'next/constants'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fetchRepoStars, formatStars, repoStars } from '@/lib/github-stars'
import loadConfig from '@/next.config'

/**
 * The header's star count. GitHub is never called: `fetch` is stubbed, so the
 * suite stays hermetic. next.config.ts asks once per build and inlines the
 * answer as `GITHUB_STARS`, so a render never fetches: a count fetched at
 * request time would not match the prerendered HTML.
 */

const REPOSITORY = 'https://github.com/GetBrew/growth-engineer'
const saved = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_STARS: process.env.GITHUB_STARS,
}

beforeEach(() => {
  delete process.env.GITHUB_TOKEN
  delete process.env.GITHUB_STARS
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

function stubFetch(answer: () => Promise<Response>) {
  const fetch = vi.fn(answer)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('fetchRepoStars', () => {
  test("reads the repository's stargazers_count from the GitHub API", async () => {
    const fetch = stubFetch(async () =>
      Response.json({ stargazers_count: 1234, name: 'growth-engineer' })
    )

    expect(await fetchRepoStars(REPOSITORY)).toBe(1234)
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.github.com/repos/GetBrew/growth-engineer')
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  test('sends a token when it has one', async () => {
    const fetch = stubFetch(async () => Response.json({ stargazers_count: 7 }))

    expect(await fetchRepoStars(REPOSITORY, 'token-123')).toBe(7)
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).toHaveProperty('Authorization', 'Bearer token-123')
  })

  test('a rate-limited or failed answer is null', async () => {
    stubFetch(async () =>
      Response.json({ message: 'API rate limit exceeded' }, { status: 403 })
    )
    expect(await fetchRepoStars(REPOSITORY)).toBeNull()
  })

  test('an answer without a count is null', async () => {
    stubFetch(async () => Response.json({ stargazers_count: 'many' }))
    expect(await fetchRepoStars(REPOSITORY)).toBeNull()
  })

  test('no network, or a timeout, is null', async () => {
    stubFetch(() =>
      Promise.reject(
        new DOMException('The operation timed out', 'TimeoutError')
      )
    )
    expect(await fetchRepoStars(REPOSITORY)).toBeNull()
  })
})

describe('next.config.ts', () => {
  test('a build asks GitHub once and inlines the count', async () => {
    process.env.GITHUB_TOKEN = 'token-123'
    const fetch = stubFetch(async () => Response.json({ stargazers_count: 42 }))

    expect((await loadConfig(PHASE_PRODUCTION_BUILD)).env).toEqual({
      GITHUB_STARS: '42',
    })
    // A build worker loads the config again and inherits the answer.
    expect((await loadConfig(PHASE_PRODUCTION_BUILD)).env).toEqual({
      GITHUB_STARS: '42',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).toHaveProperty('Authorization', 'Bearer token-123')
  })

  test('a dev server asks too; a build GitHub did not answer inlines nothing', async () => {
    stubFetch(async () => new Response(null, { status: 503 }))
    expect((await loadConfig(PHASE_DEVELOPMENT_SERVER)).env).toEqual({
      GITHUB_STARS: '',
    })
  })

  test('`next start` never asks: the count was inlined at build', async () => {
    const fetch = stubFetch(async () => Response.json({ stargazers_count: 1 }))
    expect((await loadConfig(PHASE_PRODUCTION_SERVER)).env).toEqual({
      GITHUB_STARS: '',
    })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('repoStars', () => {
  test.each([
    ['3', 3],
    ['0', 0],
    ['', null],
    [undefined, null],
    ['many', null],
    ['-1', null],
    ['1.5', null],
  ])('GITHUB_STARS=%s reads as %s', (inlined, stars) => {
    if (inlined !== undefined) {
      process.env.GITHUB_STARS = inlined
    }
    expect(repoStars()).toBe(stars)
  })
})

describe('formatStars', () => {
  test.each([
    [0, '0'],
    [1, '1'],
    [842, '842'],
    [1234, '1.2k'],
    [12_050, '12.1k'],
    [120_000, '120k'],
    [1_500_000, '1.5m'],
  ])('%i prints as %s', (stars, printed) => {
    expect(formatStars(stars)).toBe(printed)
  })
})
