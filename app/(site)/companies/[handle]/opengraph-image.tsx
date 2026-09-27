import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/seo/og-card'
import { isValidHandle, refToFilePath } from '@/lib/catalog/keys'
import { loadCompany, loadToolsByCompany } from '@/lib/catalog/loaders'
import { companyParams } from '@/lib/catalog/static-params'
import { ogOptions } from '@/lib/seo/og-font'

/** One card per company, drawn at build with the page. */
export const alt = 'A company on growth.engineer'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return companyParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const company = isValidHandle(handle) ? await loadCompany(handle) : null
  if (!company) {
    return new Response(null, { status: 404 })
  }
  const tools = await loadToolsByCompany(handle)
  const ways = [
    ...new Set(tools.flatMap((tool) => tool.access.map((entry) => entry.type))),
  ]
  return new ImageResponse(
    <OgCard
      description={
        company.tagline ??
        company.description ??
        `${company.name} on growth.engineer.`
      }
      facts={[
        `${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}`,
        ...ways.map((type) => type.toUpperCase()),
      ]}
      kind="Company"
      path={refToFilePath({
        type: 'company',
        key: company.key,
      })}
      title={company.name}
    />,
    ogOptions()
  )
}
