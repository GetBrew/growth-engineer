import {
  filePathToRef,
  filePathToTagKey,
  refToFilePath,
} from '@/lib/catalog/keys'
import {
  loadDocument,
  loadTagDocument,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { markdownFileParams } from '@/lib/catalog/static-params'

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
    const tagDocument = await loadTagDocument(tagKey)
    return tagDocument
      ? markdownResponse(tagDocument.markdown)
      : new Response('Not found', { status: 404 })
  }
  const ref = filePathToRef(pathname)
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

  return markdownResponse(document.markdown)
}

function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
