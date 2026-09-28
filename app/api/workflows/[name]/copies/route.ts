import { isValidKeyPart } from '@/lib/catalog/keys'
import { loadWorkflow } from '@/lib/catalog/loaders'
import { recordCopy } from '@/lib/usage/copies'

/**
 * `POST /api/workflows/<name>/copies` — the Copy button counts one copy of a
 * workflow's file, and learns whether it counted: `{ counted: true }` the
 * first time a visitor copies it in 24 hours, `{ counted: false }` after
 * (lib/usage/copies.ts). Only a workflow with a page is counted, and only
 * from a page: a browser marks a request another site made as
 * `Sec-Fetch-Site: cross-site`, and that is refused.
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
    const result = await recordCopy(name, request.headers)
    if (result === 'off') {
      return new Response(null, { status: 503 })
    }
    return Response.json(
      { counted: result === 'counted' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[copies] write failed:', error)
    return new Response(null, { status: 503 })
  }
}
