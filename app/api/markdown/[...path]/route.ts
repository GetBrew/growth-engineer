import { filePathToRef, refToFilePath } from '@convex/model/keys'
import { loadDocument, resolveAlias } from '@/lib/catalog/loaders'

/**
 * The markdown files. `/tools/clay/clay.md` is rewritten here by proxy.ts;
 * so is any page requested with `Accept: text/markdown`. Agents fetch these
 * with no session, by design.
 *
 * One row read per request (`documents.by_ref`, through the same tagged
 * loader the page uses, so a revalidation purges both). A renamed key answers
 * with a REAL 308 — agents follow it, and a streamed meta-refresh would not.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: Array<string> }> }
) {
  const { path } = await params
  const ref = filePathToRef(`/${path.join('/')}`)
  if (!ref) {
    return new Response('Not found', { status: 404 })
  }

  const document = await loadDocument(ref.type, ref.key)
  if (!document) {
    const alias = await resolveAlias(ref.type, ref.key)
    if (alias) {
      return Response.redirect(
        new URL(refToFilePath({ ...ref, key: alias.key }), _request.url),
        308
      )
    }
    return new Response('Not found', { status: 404 })
  }

  // v1 stores the current version only; the header names which one it is, so
  // a pin is honoured exactly when it names the current version.
  if (
    ref.version !== undefined &&
    !document.markdown.includes(`ref: workflow:${ref.key}@${ref.version}\n`)
  ) {
    return new Response('Version not found', { status: 404 })
  }

  return new Response(document.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
