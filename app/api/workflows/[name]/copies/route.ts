import { isValidKeyPart } from '@/lib/catalog/keys'
import { loadWorkflow } from '@/lib/catalog/loaders'
import { recordCopy } from '@/lib/usage/copies'

/**
 * `POST /api/workflows/<name>/copies` — the Copy button counts one copy of a
 * workflow's file (a `sendBeacon`, so nothing waits on it). Only a workflow
 * with a page is counted, and only from a page: a browser marks a request
 * another site made as `Sec-Fetch-Site: cross-site`, and that is refused.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response(null, { status: 403 })
  }
  const { name } = await params
  if (!(isValidKeyPart(name) && loadWorkflow(name))) {
    return new Response(null, { status: 404 })
  }
  try {
    const counted = await recordCopy(name)
    return new Response(null, { status: counted ? 204 : 503 })
  } catch (error) {
    console.error('[copies] write failed:', error)
    return new Response(null, { status: 503 })
  }
}
