/**
 * Keys and refs — the public identity of every record.
 *
 * Every record has an internal `_id` (the only thing stored in reference
 * fields) and a public `key`, resolved ONCE at the edge through a `by_key`
 * index. A ref is `${type}:${key}`, and it is what agents pass around.
 *
 *   company    clay
 *   tool       clay/clay                  a company's only tool uses its product name
 *   workflow   intent-to-meeting          @3 pins a version; the author (a GitHub login) is in the file
 *   tag        capability:enrich-contacts
 *
 * Keys never change after publishing. A rename lists the old key under
 * `aliases:` in the file's header and the old URL 308s.
 *
 * PURE MODULE: no runtime imports. It runs in the proxy, the build and the
 * browser, which is why the same grammar validates a URL segment at the edge
 * and a file path in the source tree.
 */

const ENTITY_TYPES = ['company', 'tool', 'workflow'] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

export const TAG_NAMESPACES = [
  'capability',
  'motion',
  'channel',
  'category',
  'fit',
  'agent',
  'has',
] as const
export type TagNamespace = (typeof TAG_NAMESPACES)[number]

/** Namespaces the system computes; nobody can propose tags in them. */
export const DERIVED_TAG_NAMESPACES: ReadonlySet<TagNamespace> = new Set([
  'agent',
  'has',
])

/**
 * One key part: lowercase letters, digits and hyphens, 2–39 characters,
 * never starting or ending with a hyphen. Readable in a prompt, safe in a URL.
 */
const KEY_PART = /^[a-z0-9][a-z0-9-]{0,37}[a-z0-9]$/
const GITHUB_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/

/**
 * Handles companies, teams and users may never take: every top-level route
 * and file the site serves, plus the words that would read as one.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'apple-icon',
  'apple-icon.png',
  'companies',
  'company',
  'favicon.ico',
  'hacks',
  'icon',
  'icon.png',
  'llms-full.txt',
  'llms.txt',
  'login',
  'manifest.webmanifest',
  'map',
  'me',
  'new',
  'opengraph-image',
  'robots.txt',
  'settings',
  'sign-in',
  'sign-up',
  'sitemap.xml',
  'submit',
  'tags',
  'teams',
  'tools',
  'twitter-image',
  'workflow',
  'workflows',
  '_next',
])

export function isValidKeyPart(value: string): boolean {
  return KEY_PART.test(value)
}

/** A company, team or user handle: one part, not reserved. */
export function isValidHandle(value: string): boolean {
  return isValidKeyPart(value) && !RESERVED_HANDLES.has(value)
}

/** `owner/name` — the shape of tool and workflow keys. */
export function isValidOwnedKey(value: string): boolean {
  const parts = value.split('/')
  return (
    parts.length === 2 &&
    isValidHandle(parts[0] ?? '') &&
    isValidKeyPart(parts[1] ?? '')
  )
}

export function isValidTagKey(value: string): boolean {
  const [namespace, slug, ...rest] = value.split(':')
  return (
    rest.length === 0 &&
    (TAG_NAMESPACES as ReadonlyArray<string>).includes(namespace ?? '') &&
    isValidKeyPart(slug ?? '')
  )
}

/**
 * A GitHub login, as GitHub defines it: alphanumerics and single hyphens,
 * up to 39 characters, never starting or ending with a hyphen. A workflow's
 * author; not a path, so case is kept as written.
 */
export function isValidGithubLogin(value: string): boolean {
  return GITHUB_LOGIN.test(value)
}

/**
 * A key of the given type: a handle for a company, `company/slug` for a tool,
 * one part for a workflow (`intent-to-meeting` — the file name under
 * workflows/; who wrote it lives in the file, not the key).
 */
function isValidKey(type: EntityType, value: string): boolean {
  switch (type) {
    case 'company':
      return isValidHandle(value)
    case 'tool':
      return isValidOwnedKey(value)
    default:
      return isValidKeyPart(value)
  }
}

const VERSION_SUFFIX = /^(.+)@(\d+)$/

/** `brew/intent-to-meeting@3` → `{ key, version: 3 }`; no suffix → `version: undefined`. */
export function splitVersionedKey(value: string): {
  key: string
  version: number | undefined
} {
  const match = VERSION_SUFFIX.exec(value)
  if (!match) {
    return { key: value, version: undefined }
  }
  const version = Number.parseInt(match[2] ?? '', 10)
  return Number.isSafeInteger(version) && version > 0
    ? { key: match[1] ?? '', version }
    : { key: value, version: undefined }
}

export type Ref = {
  type: EntityType
  key: string
  /** Only workflows carry a pin; `undefined` means the current version. */
  version: number | undefined
}

/** `tool:clay/clay` → `{ type: 'tool', key: 'clay/clay' }`; anything malformed → null. */
export function parseRef(value: string): Ref | null {
  const separator = value.indexOf(':')
  if (separator === -1) {
    return null
  }
  const type = value.slice(0, separator)
  if (!(ENTITY_TYPES as ReadonlyArray<string>).includes(type)) {
    return null
  }
  const entityType = type as EntityType
  const { key, version } = splitVersionedKey(value.slice(separator + 1))
  if (!isValidKey(entityType, key)) {
    return null
  }
  if (version !== undefined && entityType !== 'workflow') {
    return null
  }
  return { type: entityType, key, version }
}

export function formatRef(
  type: EntityType,
  key: string,
  version?: number
): string {
  return version === undefined ? `${type}:${key}` : `${type}:${key}@${version}`
}

const PATH_PREFIX: Record<EntityType, string> = {
  company: '/companies',
  tool: '/tools',
  workflow: '/workflows',
}

/** The page for a ref: `/tools/clay/clay`. */
export function refToPath(ref: Ref): string {
  const pinned =
    ref.version === undefined ? ref.key : `${ref.key}@${ref.version}`
  return `${PATH_PREFIX[ref.type]}/${pinned}`
}

/** The file for a ref: `/tools/clay/clay.md`, `/workflows/brew/x@3.md`. */
export function refToFilePath(ref: Ref): string {
  return `${refToPath(ref)}.md`
}

/**
 * `/tools/clay/clay.md` → the ref it names, or null. Accepts the three
 * top-level prefixes and a workflow version pin; rejects everything else, so
 * the route handler never looks up a path that cannot be a file.
 */
export function filePathToRef(pathname: string): Ref | null {
  if (!pathname.endsWith('.md')) {
    return null
  }
  const withoutExtension = pathname.slice(0, -'.md'.length)
  for (const [type, prefix] of Object.entries(PATH_PREFIX) as Array<
    [EntityType, string]
  >) {
    if (withoutExtension.startsWith(`${prefix}/`)) {
      return parseRef(`${type}:${withoutExtension.slice(prefix.length + 1)}`)
    }
  }
  return null
}
