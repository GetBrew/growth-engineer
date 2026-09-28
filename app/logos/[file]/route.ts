import { logoParams } from '@/lib/catalog/static-params'
import { type LogoExtension, readLogo } from '@/lib/content/read-tree'

/**
 * `/logos/<handle>.<ext>`: a company's logo, which lives beside its files at
 * `companies/<handle>/logo.<ext>` so a contributor's pull request carries it.
 * Every logo is prerendered at build and served as is.
 */

const CONTENT_TYPES: Record<LogoExtension, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

const FILE = /^([a-z0-9-]+)\.(svg|png|jpg|webp)$/

export function generateStaticParams() {
  return logoParams()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  const known = logoParams().some((param) => param.file === file)
  const match = FILE.exec(file)
  if (!(known && match)) {
    return new Response('Not found', { status: 404 })
  }
  const [, handle = '', extension = 'svg'] = match
  const bytes = readLogo(handle, extension as LogoExtension)
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': CONTENT_TYPES[extension as LogoExtension],
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'X-Content-Type-Options': 'nosniff',
      // An SVG is an image here, never a document that runs script.
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'",
    },
  })
}
