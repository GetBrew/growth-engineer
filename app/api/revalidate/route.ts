import { timingSafeEqual } from 'node:crypto'
import { parseRef } from '@convex/model/keys'
import { revalidateTag } from 'next/cache'
import { serverEnv } from '@/lib/env'

/**
 * Purge the cache for one or more refs after a file re-renders.
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <CONVEX_SERVICE_TOKEN>
 *   { "refs": ["tool:clay/clay", "workflow:brew/intent-to-meeting"] }
 *
 * Gated by the same service token every server→Convex call carries, compared
 * in constant time. Only well-formed refs are accepted, so a caller cannot
 * purge arbitrary tags.
 */
const BEARER_PREFIX = /^Bearer\s+/i
const MAX_REFS_PER_CALL = 100

export async function POST(request: Request) {
  const expected = serverEnv().CONVEX_SERVICE_TOKEN
  const presented =
    request.headers.get('authorization')?.replace(BEARER_PREFIX, '') ?? ''
  const a = Buffer.from(presented)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: { refs?: unknown }
  try {
    body = (await request.json()) as { refs?: unknown }
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 })
  }
  const refs = Array.isArray(body.refs)
    ? body.refs.filter(
        (value): value is string =>
          typeof value === 'string' && parseRef(value) !== null
      )
    : []
  if (refs.length === 0) {
    return Response.json(
      { error: 'refs must be a non-empty array of refs.' },
      { status: 400 }
    )
  }

  const accepted = refs.slice(0, MAX_REFS_PER_CALL)
  for (const ref of accepted) {
    revalidateTag(ref, 'max')
  }
  return Response.json({ revalidated: accepted.length })
}
