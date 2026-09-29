/**
 * Keys and refs — the public identity of every record.
 *
 * The public `key` IS the identity: it is the file's path and the page's
 * URL, so nothing else identifies a record. A ref is `${type}:${key}`, and it
 * is what agents pass around.
 *
 *   company    apollo
 *   tool       apollo/enrich-person       named after the function it performs
 *   workflow   funding-signal-outbound    the author (a GitHub login) is in the file
 *   tag        capability:enrich-contacts
 *
 * Keys never change after publishing. A rename lists the old key under
 * `aliases:` in the file's header and the old URL 308s.
 *
 * PURE MODULE: no runtime imports. It runs in the proxy, the build and the
 * browser, which is why the same grammar validates a URL segment at the edge
 * and a file path in the source tree.
 */

export const ENTITY_TYPES = ['company', 'tool', 'workflow'] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

export const TAG_NAMESPACES = [
  'capability',
  'motion',
  'channel',
  'category',
  'has',
] as const
export type TagNamespace = (typeof TAG_NAMESPACES)[number]

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
  'add-a-tool',
  'add-a-workflow',
  'add-your-company',
  'admin',
  'api',
  'apple-icon',
  'apple-icon.png',
  'cli',
  'companies',
  'company',
  'contribute',
  'docs',
  'favicon.ico',
  'hacks',
  'icon',
  'icon.png',
  'llms-full.txt',
  'llms.txt',
  'login',
  'logos',
  'manifest.webmanifest',
  'map',
  'mcp',
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

/**
 * Workflow keys the MCP server's contribute prompts use (lib/mcp/prompts.ts):
 * a workflow named like one would shadow it in a client's prompt list.
 */
export const RESERVED_WORKFLOW_KEYS: ReadonlySet<string> = new Set([
  'contribute-workflow',
  'contribute-tool',
  'contribute-company',
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
 * one part for a workflow (`funding-signal-outbound` — the file name under
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

export type Ref = {
  type: EntityType
  key: string
}

/** `tool:apollo/enrich-person` → `{ type: 'tool', key: 'apollo/enrich-person' }`; anything malformed → null. */
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
  const key = value.slice(separator + 1)
  return isValidKey(entityType, key) ? { type: entityType, key } : null
}

export function formatRef(type: EntityType, key: string): string {
  return `${type}:${key}`
}

const PATH_PREFIX: Record<EntityType, string> = {
  company: '/companies',
  tool: '/tools',
  workflow: '/workflows',
}

/** The page for a ref: `/tools/apollo/enrich-person`. */
export function refToPath(ref: Ref): string {
  return `${PATH_PREFIX[ref.type]}/${ref.key}`
}

/** The file for a ref: `/tools/apollo/enrich-person.md`, `/workflows/funding-signal-outbound.md`. */
export function refToFilePath(ref: Ref): string {
  return `${refToPath(ref)}.md`
}

/**
 * `/tools/apollo/enrich-person.md` → the ref it names, or null. Accepts the three
 * top-level prefixes; rejects everything else, so the route handler never
 * looks up a path that cannot be a file.
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

const TAG_FILE = /^\/tags\/([a-z]+)\/([a-z0-9-]+)\.md$/

/** A tag's file: `capability:enrich-contacts` → `/tags/capability/enrich-contacts.md`. */
export function tagFilePath(key: string): string {
  const [namespace, slug] = key.split(':')
  return `/tags/${namespace}/${slug}.md`
}

/** `/tags/capability/enrich-contacts.md` → the tag key it names, or null. */
export function filePathToTagKey(pathname: string): string | null {
  const match = TAG_FILE.exec(pathname)
  const key = match ? `${match[1]}:${match[2]}` : ''
  return isValidTagKey(key) ? key : null
}

/**
 * The SOURCE file behind a ref, from the repo root. Not the same as
 * `refToFilePath`, the rendered `.md` URL this site serves: a tool renders at
 * `/tools/apollo/enrich-person.md` but is WRITTEN at
 * `companies/apollo/tools/enrich-person.md`. The key carries both.
 */
export function refToSourcePath(ref: {
  type: EntityType
  key: string
}): string {
  if (ref.type === 'company') {
    return `companies/${ref.key}/company.md`
  }
  if (ref.type === 'tool') {
    const [handle, slug] = ref.key.split('/')
    return `companies/${handle}/tools/${slug}.md`
  }
  return `workflows/${ref.key}.md`
}
