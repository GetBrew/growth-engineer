import { afterEach, describe, expect, test, vi } from 'vitest'
import { formatStars, repoStars } from '@/lib/github-stars'

/**
 * The header's star count. GitHub is never called: `fetch` is stubbed, so the
 * suite stays hermetic. Every failure must come back as `null` — the button
 * then shows without a count — because a build never fails on GitHub.
 */

// `cacheLife()` only works inside a Next render; here it is inert.
vi.mock('next/cache', () => ({ cacheLife: () => undefined }))

const savedToken = process.env.GITHUB_TOKEN

afterEach(() => {
  vi.unstubAllGlobals()
  if (savedToken === undefined) {
    delete process.env.GITHUB_TOKEN
  } else {
    process.env.GITHUB_TOKEN = savedToken
  }
})

function stubFetch(answer: () => Promise<Response>) {
  const fetch = vi.fn(answer)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('repoStars', () => {
  test("reads the repository's stargazers_count from the GitHub API", async () => {
    delete process.env.GITHUB_TOKEN
    const fetch = stubFetch(async () =>
      Response.json({ stargazers_count: 1234, name: 'growth-engineer' })
    )

    expect(await repoStars()).toBe(1234)
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.github.com/repos/GetBrew/growth-engineer')
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  test('sends GITHUB_TOKEN when one is set', async () => {
    process.env.GITHUB_TOKEN = 'token-123'
    const fetch = stubFetch(async () => Response.json({ stargazers_count: 7 }))

    expect(await repoStars()).toBe(7)
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).toHaveProperty('Authorization', 'Bearer token-123')
  })

  test('a rate-limited or failed answer is null', async () => {
    stubFetch(async () =>
      Response.json({ message: 'API rate limit exceeded' }, { status: 403 })
    )
    expect(await repoStars()).toBeNull()
  })

  test('an answer without a count is null', async () => {
    stubFetch(async () => Response.json({ stargazers_count: 'many' }))
    expect(await repoStars()).toBeNull()
  })

  test('no network, or a timeout, is null', async () => {
    stubFetch(() =>
      Promise.reject(
        new DOMException('The operation timed out', 'TimeoutError')
      )
    )
    expect(await repoStars()).toBeNull()
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
