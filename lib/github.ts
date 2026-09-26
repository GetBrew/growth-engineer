import { SITE } from '@/lib/catalog/definitions'
import { type EntityType, refToSourcePath } from '@/lib/catalog/keys'

/**
 * The repository is the catalog, so the repo URL is a product link, not a
 * footer courtesy: "Contribute" means open a pull request against these files.
 * It is stated once, in `SITE.repository`.
 */
export const GITHUB_URL = SITE.repository

/** The branch the catalog is served from; what a source link points at. */
const DEFAULT_BRANCH = 'main'

/** A file in the repository, as GitHub shows it: `workflows/README.md`. */
export function repoFileUrl(path: string): string {
  return `${GITHUB_URL}/blob/${DEFAULT_BRANCH}/${path}`
}

/**
 * Where that file lives on GitHub. `/blob/` rather than `/edit/`: it opens the
 * file as written, and GitHub's own pencil turns reading into a pull request
 * for anyone who wants one.
 */
export function sourceFileUrl(ref: { type: EntityType; key: string }): string {
  return repoFileUrl(refToSourcePath(ref))
}

/**
 * A contributor's photo, straight from their GitHub profile. A workflow's
 * `author` IS a GitHub login, so there is nothing to store and nothing to
 * invent — the avatar is real or GitHub serves its own identicon.
 *
 * Rendered through a plain `<img>`: a remote photo, loaded straight from
 * GitHub, never proxied through this site.
 */
export function githubAvatarUrl(login: string, size = 96): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=${size}`
}

/** Where a contributor's work lives. */
export function githubProfileUrl(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}`
}
