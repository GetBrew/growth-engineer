import { filePathToRef, refToFilePath } from '@/lib/catalog/keys'
import { loadDocument, resolveAlias } from '@/lib/catalog/loaders'
import { markdownFileParams } from '@/lib/catalog/static-params'

/**
 * The markdown files. `/tools/clay/enrich-contacts.md` is rewritten here by
 * proxy.ts; so is any page requested with `Accept: text/markdown`. Agents
 * fetch these with no session, by design.
 *
 * PRERENDERED: every file, every current version pin and every old key is a
 * static param, and the handler never reads the request, so the build writes
 * each response once and the CDN serves it. A renamed key answers with a REAL
 * 308 (a relative `Location`, because reading `request.url` would make the
 * route dynamic) — agents follow it, and a streamed meta-refresh would not.
 * Any other path renders on demand from the same in-memory catalog and is a
 * 404 (Cache Components does not allow `dynamicParams = false`).
 */
export function generateStaticParams() {
  return markdownFileParams()
}

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
      return new Response(null, {
        status: 308,
        headers: { Location: refToFilePath({ ...ref, key: alias.key }) },
      })
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
