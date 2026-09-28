import { z } from 'zod'

/**
 * The repository's GitHub star count, shown in the header.
 *
 * next.config.ts asks GitHub ONCE per build and inlines the answer as
 * `process.env.GITHUB_STARS`, so every render prints the same number: the
 * prerendered HTML and any request-time render of the same page alike, until
 * the next deploy. Fetching during a render does not hold: a page with a
 * copy-count hole re-renders its server components on every request, and a
 * count that moved since the build no longer matches the prerendered HTML
 * (React error #418, and the browser re-renders the whole page).
 *
 * No `server-only` and no path aliases: next.config.ts imports this file.
 */

const TIMEOUT_MS = 2000
const repoSchema = z.object({
  stargazers_count: z.number().int().nonnegative(),
})

/**
 * Asks the GitHub API for the repository's stars. Offline, rate limited or
 * slower than two seconds, it answers `null`: a build never fails or waits
 * on GitHub. Called by next.config.ts only.
 */
export async function fetchRepoStars(
  repository: string,
  token?: string
): Promise<number | null> {
  const url = repository.replace(
    'https://github.com/',
    'https://api.github.com/repos/'
  )
  try {
    const response = await fetch(url, {
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

/** The count this build fetched, or `null` when GitHub did not answer. */
export function repoStars(): number | null {
  const stars = Number(process.env.GITHUB_STARS || Number.NaN)
  return Number.isSafeInteger(stars) && stars >= 0 ? stars : null
}

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** A count the way GitHub prints it: `842`, `1.2k`, `12k`. */
export function formatStars(stars: number): string {
  return compact.format(stars).toLowerCase()
}
