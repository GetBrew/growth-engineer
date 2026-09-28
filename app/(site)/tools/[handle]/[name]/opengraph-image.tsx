import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/seo/og-card'
import { isValidOwnedKey, refToFilePath } from '@/lib/catalog/keys'
import { loadTool } from '@/lib/catalog/loaders'
import { toolParams } from '@/lib/catalog/static-params'
import { ogOptions } from '@/lib/seo/og-font'

/** One card per tool, drawn at build with the page (`generateStaticParams`). */
export const alt = 'A tool on growth.engineer'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return toolParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string; name: string }>
}) {
  const { handle, name } = await params
  const key = `${handle}/${name}`
  const result = isValidOwnedKey(key) ? loadTool(key) : null
  if (!result) {
    return new Response(null, { status: 404 })
  }
  const { tool, company } = result
  const ways = [...new Set(tool.access.map((entry) => entry.type))]
  return new ImageResponse(
    <OgCard
      description={tool.summary}
      facts={[`by ${company.name}`, ...ways.map((type) => type.toUpperCase())]}
      kind="Tool"
      path={refToFilePath({ type: 'tool', key: tool.key })}
      title={tool.name}
    />,
    ogOptions()
  )
}
