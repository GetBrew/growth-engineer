/**
 * The repository is the catalog, so the repo URL is a product link, not a
 * footer courtesy: "Contribute" means open a pull request against these files.
 * One constant so the navbar, the menu and the submit page cannot drift.
 */
export const GITHUB_URL = 'https://github.com/GetBrew/growth-engineer'

/**
 * A contributor's photo, straight from their GitHub profile. A workflow's
 * `author` IS a GitHub login, so there is nothing to store and nothing to
 * invent — the avatar is real or GitHub serves its own identicon.
 *
 * Rendered through a plain `<img>` (Base UI's Avatar), so it needs no entry in
 * `next.config.ts` remotePatterns and never touches the image optimizer.
 */
export function githubAvatarUrl(login: string, size = 96): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=${size}`
}

/** Where a contributor's work lives. */
export function githubProfileUrl(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}`
}
