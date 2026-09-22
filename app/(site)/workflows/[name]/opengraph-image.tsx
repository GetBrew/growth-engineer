import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/seo/og-card'
import {
  isValidKeyPart,
  refToFilePath,
  splitVersionedKey,
} from '@/lib/catalog/keys'
import { loadWorkflow } from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'
import { ogOptions } from '@/lib/seo/og-font'

/** One card per workflow (and its version pin), drawn at build with the page. */
export const alt = 'A workflow on growth.engineer'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return workflowParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const { key, version } = splitVersionedKey(decodeURIComponent(name))
  const result = isValidKeyPart(key) ? await loadWorkflow(key, version) : null
  if (!result) {
    return new Response(null, { status: 404 })
  }
  const { workflow } = result
  return new ImageResponse(
    <OgCard
      description={workflow.summary}
      facts={[
        `by @${workflow.author}`,
        `${workflow.toolCount} ${workflow.toolCount === 1 ? 'tool' : 'tools'}`,
        `v${workflow.version}`,
      ]}
      kind="Workflow"
      path={refToFilePath({
        type: 'workflow',
        key: workflow.key,
        version: undefined,
      })}
      title={workflow.title}
    />,
    ogOptions()
  )
}
