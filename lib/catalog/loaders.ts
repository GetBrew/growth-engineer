import 'server-only'

import { type EntityType, formatRef } from '@convex/model/keys'
import { cacheLife, cacheTag } from 'next/cache'
import { api } from '@/convex/_generated/api'
import { publicQuery } from '@/lib/convex/gateway'

/**
 * The catalog's server-side loaders, and the caching contract they implement.
 *
 * `convex/nextjs` fetches are `cache: 'no-store'`. Inside a `'use cache'`
 * scope they run for real — including at BUILD time for a page with no
 * params — and a catch inside that scope would cache the empty result for
 * the whole `cacheLife` window. So:
 *
 *   PER-KEY loaders   `'use cache: remote'` + `cacheTag(ref)` + an explicit
 *                     life. They only ever run with request-time keys, so the
 *                     build never contacts Convex, and `revalidateTag(ref)`
 *                     purges a page and its `.md` file together.
 *   LIST loaders      plain reads. The page's Suspense child awaits
 *                     `connection()` first, so the build stops at the
 *                     boundary; Convex's own query cache is the cache.
 *   SEARCH            plain reads, unique per URL, never cached here.
 *
 * No loader catches. A failure is thrown out of the cached scope and rendered
 * by error.tsx, which is never cached.
 */

export const LIST_TAG = {
  companies: 'catalog:companies',
  tools: 'catalog:tools',
  workflows: 'catalog:workflows',
  tags: 'catalog:tags',
} as const

/** One hour fresh, a day stale-while-revalidate. */
const PER_KEY_LIFE = { stale: 300, revalidate: 3600, expire: 86_400 }

/* ───────────────────────────────── per key ───────────────────────────────── */

export async function loadCompany(key: string) {
  'use cache: remote'
  cacheTag(formatRef('company', key))
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.companies.getByKey, { key })
}

export async function loadTool(key: string) {
  'use cache: remote'
  cacheTag(formatRef('tool', key))
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.tools.getByKey, { key })
}

export async function loadWorkflow(key: string, version: number | undefined) {
  'use cache: remote'
  cacheTag(formatRef('workflow', key))
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.workflows.getByKey, {
    key,
    ...(version === undefined ? {} : { version }),
  })
}

/** The rendered file for a ref (no version pin — the header carries it). */
export async function loadDocument(type: EntityType, key: string) {
  'use cache: remote'
  const ref = formatRef(type, key)
  cacheTag(ref)
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.documents.getByRef, { ref })
}

export async function loadToolsByCompany(companyKey: string) {
  'use cache: remote'
  cacheTag(formatRef('company', companyKey), LIST_TAG.tools)
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.tools.listByCompany, { companyKey })
}

export async function loadWorkflowsByTool(toolKey: string) {
  'use cache: remote'
  cacheTag(formatRef('tool', toolKey), LIST_TAG.workflows)
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.workflows.listByTool, { toolKey })
}

export async function loadWorkflowsByCompany(companyKey: string) {
  'use cache: remote'
  cacheTag(formatRef('company', companyKey), LIST_TAG.workflows)
  cacheLife(PER_KEY_LIFE)
  return await publicQuery(api.workflows.listByCompany, { companyKey })
}

/** An old key → its current one, or null. Rare; not cached. */
export async function resolveAlias(entityType: EntityType, key: string) {
  return await publicQuery(api.aliases.resolve, { entityType, key })
}

/* ─────────────────────────────────── lists ───────────────────────────────── */
/* Call these only after `await connection()` in the Suspense child.          */

export async function loadCompanies(limit = 200) {
  return await publicQuery(api.companies.list, { limit })
}

export async function loadNewTools(limit = 12) {
  return await publicQuery(api.tools.listNew, { limit })
}

export async function loadWorkflows(
  sort: 'trending' | 'top' | 'new',
  format: 'hack' | 'workflow' | undefined,
  limit = 30
) {
  return await publicQuery(api.workflows.list, {
    sort,
    ...(format ? { format } : {}),
    limit,
  })
}

export async function loadActiveTags() {
  return await publicQuery(api.tags.listActive, {})
}

/* ─────────────────────────────────── search ──────────────────────────────── */

export async function searchTools(q: string, chips: ReadonlyArray<string>) {
  return await publicQuery(api.tools.search, {
    q,
    chips: [...chips],
    limit: 24,
  })
}

export async function searchWorkflows(
  q: string,
  format: 'hack' | 'workflow' | undefined
) {
  return await publicQuery(api.workflows.search, {
    q,
    ...(format ? { format } : {}),
    limit: 30,
  })
}

export async function searchCompanies(q: string) {
  return await publicQuery(api.companies.search, { q, limit: 50 })
}

/** Every file, for `/llms.txt`. */
export async function loadDocumentRefs() {
  return await publicQuery(api.documents.listRefs, { limit: 1000 })
}
