import { filePathToRef, refToFilePath } from '@/lib/catalog/keys'
import { loadDocument, resolveAlias } from '@/lib/catalog/loaders'
import { markdownFileParams } from '@/lib/catalog/static-params'

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

  return new Response(document.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
