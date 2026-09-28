import 'server-only'
import { cacheLife } from 'next/cache'
import { z } from 'zod'
import { githubToken } from '@/lib/env'
import { GITHUB_URL } from '@/lib/github'

/**
 * The repository's star count, shown in the header. It is read once per
 * build and prerendered into every page: `revalidate: Infinity` keeps the
 * pages fully static, and the next deploy reads it again. Offline, rate
 * limited or slow, the count is `null` and the header shows the button
 * without it; a build never fails or waits on GitHub.
 */

const API_URL = GITHUB_URL.replace(
  'https://github.com/',
  'https://api.github.com/repos/'
)
const TIMEOUT_MS = 2000
const repoSchema = z.object({
  stargazers_count: z.number().int().nonnegative(),
})

export async function repoStars(): Promise<number | null> {
  'use cache'
  cacheLife({
    revalidate: Number.POSITIVE_INFINITY,
    expire: Number.POSITIVE_INFINITY,
  })

  const token = githubToken()
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) {
      return null
    }
    const repo = repoSchema.safeParse(await response.json())
    return repo.success ? repo.data.stargazers_count : null
  } catch {
    return null
  }
}

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** A count the way GitHub prints it: `842`, `1.2k`, `12k`. */
export function formatStars(stars: number): string {
  return compact.format(stars).toLowerCase()
}
