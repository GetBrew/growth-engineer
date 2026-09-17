/**
 * Key and file policy for the growth.engineer upload-to-cdn skill.
 *
 * Unlike the Brew copy of this skill — whose lists mirror
 * `lib/shared/blob/shared-key-prefixes.ts` and are pinned to it by a drift
 * test — growth.engineer has no keyspace registry in code yet. These lists
 * ARE the registry. When the app grows one, mirror it here and add a drift
 * test, the way the Brew repo does.
 *
 * Rules:
 *   - A key may only land in a global-static keyspace that no other writer
 *     owns (`assets/` by default). Immutable, cross-tenant keyspaces are
 *     refused whether the requested prefix sits inside one or covers one.
 *   - A file whose name or first bytes look like a credential is refused
 *     unless the caller states it is meant to be public.
 */

/**
 * Cross-tenant, write-once keyspaces. Never a target for this skill.
 *
 * Empty today: the `growtheng-cdn` store holds no tenant-owned data. This is
 * the extension point — the moment growth.engineer writes per-user or
 * per-org blobs, list their prefixes here so this skill can never land a
 * key on top of them.
 */
export const IMMUTABLE_BLOB_KEY_PREFIXES = []

/** Tenant-less keyspaces safe to publish into. */
export const GLOBAL_STATIC_BLOB_KEY_PREFIXES = [
  '_next/',
  'assets/',
  'icons/',
  'media/',
]

/** Keyspaces this skill may write into: global-static, minus Next's own. */
export const WRITABLE_BLOB_KEY_PREFIXES = GLOBAL_STATIC_BLOB_KEY_PREFIXES.filter(
  (prefix) => prefix !== '_next/'
)

/**
 * Decide whether `--prefix` may be used. Returns `{ ok: true, clean }` or
 * `{ ok: false, clean, reason }`; `clean` has surrounding slashes removed.
 */
export function classifyPrefix(prefix) {
  const clean = String(prefix ?? '').replace(/^\/+|\/+$/g, '')
  if (!/^[a-z0-9][a-z0-9/_-]*$/.test(clean)) {
    return { ok: false, clean, reason: 'use lowercase letters, digits, - _ /' }
  }
  const key = `${clean}/`
  const immutable = IMMUTABLE_BLOB_KEY_PREFIXES.find(
    (candidate) => key.startsWith(candidate) || candidate.startsWith(key)
  )
  if (immutable) {
    return {
      ok: false,
      clean,
      reason: `"${immutable}" is a cross-tenant, write-once keyspace`,
    }
  }
  const writable = WRITABLE_BLOB_KEY_PREFIXES.find((candidate) =>
    key.startsWith(candidate)
  )
  if (!writable) {
    return {
      ok: false,
      clean,
      reason: `not a global-static keyspace (allowed: ${WRITABLE_BLOB_KEY_PREFIXES.map((candidate) => candidate.slice(0, -1)).join(', ')}); register a new one in GLOBAL_STATIC_BLOB_KEY_PREFIXES in this file first`,
    }
  }
  return { ok: true, clean, keyspace: writable }
}

const SECRET_NAME_PATTERNS = [
  /^\.env(\..*)?$/i,
  /\.(pem|key|p12|pfx|jks|keystore|kdbx|asc|gpg|ppk)$/i,
  /^id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
  /^\.(npmrc|netrc|pgpass|git-credentials|htpasswd)$/i,
  /credentials?\.json$/i,
  /service-account.*\.json$/i,
  /^\.?secrets?(\.|$)/i,
]

const SECRET_CONTENT_PATTERN =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bsk_(?:live|test)_[A-Za-z0-9]{8,}|\bwhsec_[A-Za-z0-9]{8,}|\bvercel_blob_rw_[A-Za-z0-9_]{8,}|\bgh[pousr]_[A-Za-z0-9]{16,}|\bAKIA[0-9A-Z]{16}\b|\bxox[baprs]-[A-Za-z0-9-]{8,}|\bsk-ant-[A-Za-z0-9_-]{8,}|\b(?:BLOB_READ_WRITE_TOKEN|GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN|CLERK_SECRET_KEY|INTERNAL_API_SECRET|CONVEX_DEPLOY_KEY)\s*=/

/**
 * Why a file must not be published, or `null` when it looks safe. `head` is
 * the file's first few KB decoded as text (binary media never matches).
 */
export function describeSensitiveFile(name, head) {
  const base = String(name ?? '')
  if (SECRET_NAME_PATTERNS.some((pattern) => pattern.test(base))) {
    return `file name "${base}" looks like a credential or secret file`
  }
  if (head && SECRET_CONTENT_PATTERN.test(String(head))) {
    return `the file's contents look like a credential (private key, API key or a secret-bearing env line)`
  }
  return null
}
