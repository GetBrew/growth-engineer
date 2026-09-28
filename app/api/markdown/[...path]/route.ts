import {
  filePathToRef,
  filePathToTagKey,
  refToFilePath,
  refToPath,
} from '@/lib/catalog/keys'
import {
  loadDocument,
  loadTagDocument,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { markdownFileParams } from '@/lib/catalog/static-params'
import { SITE_ORIGIN } from '@/lib/env'

export function generateStaticParams() {
  return markdownFileParams()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: Array<string> }> }
) {
  const { path } = await params
  const pathname = `/${path.join('/')}`
  const tagKey = filePathToTagKey(pathname)
  if (tagKey) {
    const tagDocument = loadTagDocument(tagKey)
    return tagDocument
      ? markdownResponse(tagDocument.markdown)
      : new Response('Not found', { status: 404 })
  }
  const ref = filePathToRef(pathname)
  if (!ref) {
    return new Response('Not found', { status: 404 })
  }

  const document = loadDocument(ref.type, ref.key)
  if (!document) {
    const alias = resolveAlias(ref.type, ref.key)
    if (alias) {
      return new Response(null, {
        status: 308,
        headers: { Location: refToFilePath({ ...ref, key: alias.key }) },
      })
    }
    return new Response('Not found', { status: 404 })
  }

  return markdownResponse(document.markdown, refToPath(ref))
}

/**
 * A company, tool or workflow file is the content of its page, so it names
 * the page as its canonical URL: a search engine indexes the page instead of
 * a second copy of it, and an agent still gets the file. A tag's file has no
 * page, so it names none.
 */
function markdownResponse(markdown: string, pagePath?: string): Response {
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
      ...(pagePath
        ? { Link: `<${SITE_ORIGIN}${pagePath}>; rel="canonical"` }
        : {}),
    },
  })
}
