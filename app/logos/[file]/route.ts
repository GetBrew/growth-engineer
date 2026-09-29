import { loadCompany, resolveAlias } from '@/lib/catalog/loaders'
import { logoParams } from '@/lib/catalog/static-params'

/**
 * `/logos/<handle>.<ext>`: where the site served logos before they moved to
 * cdn.growth.engineer (lib/content/logos.ts). A company page's structured
 * data named these URLs, so each still answers, with a 308 to the company's
 * logo today, whatever extension it asks for.
 */

const FILE = /^([a-z0-9-]+)\.(svg|png|jpg|webp)$/

export function generateStaticParams() {
  return logoParams()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  const handle = FILE.exec(file)?.[1] ?? ''
  const key = loadCompany(handle)
    ? handle
    : resolveAlias('company', handle)?.key
  const logo = key ? loadCompany(key)?.logo : undefined
  if (!logo) {
    return new Response('Not found', { status: 404 })
  }
  return new Response(null, { status: 308, headers: { Location: logo.url } })
}
