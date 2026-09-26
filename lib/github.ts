import { SITE } from '@/lib/catalog/definitions'
import type { EntityType } from '@/lib/catalog/keys'

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
 * The SOURCE file behind a page, relative to the repo root. Not the same as
 * `refToFilePath`, which is the rendered `.md` URL this site serves: a tool
 * renders at `/tools/clay/enrich-contacts.md` but is WRITTEN at
 * `companies/clay/tools/enrich-contacts.md`. The key carries both, so neither
 * path has to be stored.
 *
 * A workflow's version pin is dropped: `@3` is a rendered snapshot, while the
 * file on the branch is only ever the current one.
 */
function sourceFilePath(ref: { type: EntityType; key: string }): string {
  if (ref.type === 'company') {
    return `companies/${ref.key}/company.md`
  }
  if (ref.type === 'tool') {
    const [handle, capability] = ref.key.split('/')
    return `companies/${handle}/tools/${capability}.md`
  }
  return `workflows/${ref.key}.md`
}

/**
 * Where that file lives on GitHub. `/blob/` rather than `/edit/`: it opens the
 * file as written, and GitHub's own pencil turns reading into a pull request
 * for anyone who wants one.
 */
export function sourceFileUrl(ref: { type: EntityType; key: string }): string {
  return repoFileUrl(sourceFilePath(ref))
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
