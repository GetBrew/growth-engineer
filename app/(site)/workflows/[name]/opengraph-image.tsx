import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/seo/og-card'
import { isValidKeyPart, refToFilePath } from '@/lib/catalog/keys'
import { loadWorkflow } from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'
import { ogOptions } from '@/lib/seo/og-font'

/** One card per workflow, drawn at build with the page. */
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
  const { name: key } = await params
  const result = isValidKeyPart(key) ? loadWorkflow(key) : null
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
      ]}
      kind="Workflow"
      path={refToFilePath({
        type: 'workflow',
        key: workflow.key,
      })}
      title={workflow.title}
    />,
    ogOptions()
  )
}
