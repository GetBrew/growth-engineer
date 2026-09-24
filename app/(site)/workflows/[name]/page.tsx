import { File01Icon } from '@hugeicons/core-free-icons'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { accessTypeLabels } from '@/components/catalog/badges'
import { CatalogList, toolListItem } from '@/components/catalog/catalog-list'
import { NoResults } from '@/components/catalog/no-results'
import { PANEL_HEADING } from '@/components/detail/chrome'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/detail/detail-header'
import { MarkdownFile } from '@/components/detail/markdown-file'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { MaskIcon } from '@/components/layout/mask-icon'
import { BackLink, Page } from '@/components/layout/primitives'
import { WorkflowDetailSkeleton } from '@/components/skeletons/workflow-detail-skeleton'
import {
  isValidKeyPart,
  refToFilePath,
  refToPath,
  splitVersionedKey,
} from '@/lib/catalog/keys'
import { loadDocument, loadWorkflow, resolveAlias } from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'
import { cn } from '@/lib/utils/cn'

type Params = Promise<{ name: string }>

async function resolveParams(params: Params) {
  const { name } = await params
  const { key, version } = splitVersionedKey(decodeURIComponent(name))
  return isValidKeyPart(key) ? { key, version } : null
}

export function generateStaticParams() {
  return workflowParams()
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const resolved = await resolveParams(params)
  if (!resolved) {
    return {}
  }
  const result = await loadWorkflow(resolved.key, resolved.version)
  return result
    ? { title: result.workflow.title, description: result.workflow.summary }
    : {}
}

export default function WorkflowPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/workflows" label="All workflows" />
      <Suspense fallback={<WorkflowDetailSkeleton />}>
        <WorkflowDetail params={params} />
      </Suspense>
    </Page>
  )
}

async function WorkflowDetail({ params }: { params: Params }) {
  const resolved = await resolveParams(params)
  if (!resolved) {
    notFound()
  }
  const [result, document] = await Promise.all([
    loadWorkflow(resolved.key, resolved.version),
    loadDocument('workflow', resolved.key),
  ])
  if (!result) {
    const alias =
      resolved.version === undefined
        ? await resolveAlias('workflow', resolved.key)
        : null
    if (alias) {
      permanentRedirect(
        refToPath({ type: 'workflow', key: alias.key, version: undefined })
      )
    }
    notFound()
  }

  const { workflow, version, tools, toolItems, tags } = result
  const ref = {
    type: 'workflow' as const,
    key: workflow.key,
    version: resolved.version,
  }
  const filePath = refToFilePath(ref)

  const dates = [`Updated ${DETAIL_DATE.format(version.updatedAt)}`]

  const author = {
    name: workflow.author,
    avatar: `https://github.com/${encodeURIComponent(workflow.author)}.png?size=96`,
    href: `https://github.com/${encodeURIComponent(workflow.author)}`,
  }
  const available = accessTypeLabels(
    tools.flatMap(({ tool }) => tool.access.map((entry) => entry.type))
  )

  return (
    <div className="flex flex-col gap-(--space-block)">
      <DetailHeader
        actions={
          <>
            <ShareButton text={workflow.summary} title={workflow.title} />
            {document ? (
              <OpenInAgentMenu
                filePath={filePath}
                markdown={document.markdown}
                title={workflow.title}
              />
            ) : null}
          </>
        }
        available={available}
        byline={
          <DetailByline avatars={[{ name: author.name, src: author.avatar }]}>
            by{' '}
            <a
              className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-foreground underline-offset-4 hover:underline"
              href={author.href}
              rel="noreferrer"
              target="_blank"
            >
              @{author.name}
              <MaskIcon
                className="text-soft"
                size={14}
                src="/social/github.svg"
              />
            </a>
          </DetailByline>
        }
        dates={dates}
        description={workflow.summary}
        tags={tags.map((tag) => ({
          label: tag.label,
          href: `/workflows?tag=${encodeURIComponent(tag.key)}`,
        }))}
        title={workflow.title}
      />

      <div className="flex min-w-0 flex-col gap-(--space-block)">
        <section className="flex flex-col gap-(--space-md)">
          {document ? (
            <MarkdownFile
              fileName={filePath.split('/').pop() ?? 'workflow.md'}
              markdown={document.markdown}
            />
          ) : (
            <NoResults
              description="It appears here as soon as the catalog renders it."
              icon={File01Icon}
              title="No file yet"
              variant="card"
            />
          )}
        </section>
        <section className="flex flex-col">
          {/* `min-h-0`: the heading's button-height box exists to line up with a
              column beside it, and this page has none. */}
          <h2 className={cn(PANEL_HEADING, 'min-h-0')}>Built from</h2>
          <CatalogList items={toolItems.map(toolListItem)} />
        </section>
      </div>
    </div>
  )
}
