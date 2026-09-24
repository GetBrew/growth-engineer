import { Book02Icon, File01Icon, GlobalIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { accessLabels } from '@/components/catalog/badges'
import {
  CatalogList,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import { NoResults } from '@/components/catalog/no-results'
import { AgentReadiness } from '@/components/detail/agent-readiness'
import { PANEL_HEADING } from '@/components/detail/chrome'
import { DescriptionSection } from '@/components/detail/description-section'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/detail/detail-header'
import { MarkdownFile } from '@/components/detail/markdown-file'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { ToolAccessPanel } from '@/components/detail/tool-access-panel'
import { BackLink, Page } from '@/components/layout/primitives'
import { ToolDetailSkeleton } from '@/components/skeletons/tool-detail-skeleton'
import { isValidOwnedKey, refToFilePath } from '@/lib/catalog/keys'
import {
  loadDocument,
  loadTool,
  loadWorkflowsByTool,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { toolParams } from '@/lib/catalog/static-params'

type Params = Promise<{ handle: string; name: string }>

async function keyFrom(params: Params): Promise<string | null> {
  const { handle, name } = await params
  const key = `${handle}/${name}`
  return isValidOwnedKey(key) ? key : null
}

export function generateStaticParams() {
  return toolParams()
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const key = await keyFrom(params)
  const result = key ? await loadTool(key) : null
  return result
    ? {
        title: `${result.tool.name} by ${result.company.name}`,
        description: result.tool.summary,
      }
    : {}
}

export default function ToolPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/tools" label="All tools" />
      <Suspense fallback={<ToolDetailSkeleton />}>
        <ToolDetail params={params} />
      </Suspense>
    </Page>
  )
}

async function ToolDetail({ params }: { params: Params }) {
  const key = await keyFrom(params)
  if (!key) {
    notFound()
  }
  const [result, document, workflows] = await Promise.all([
    loadTool(key),
    loadDocument('tool', key),
    loadWorkflowsByTool(key),
  ])
  if (!result) {
    const alias = await resolveAlias('tool', key)
    if (alias) {
      permanentRedirect(`/tools/${alias.key}`)
    }
    notFound()
  }
  const { tool, company, capabilities } = result
  const filePath = refToFilePath({
    type: 'tool',
    key: tool.key,
    version: undefined,
  })

  const docsUrl = tool.access.find((access) => access.docsUrl)?.docsUrl

  const links = [
    { label: 'Website', href: company.links.website, icon: GlobalIcon },
    { label: 'Docs', href: docsUrl, icon: Book02Icon },
  ].filter(
    (link): link is { label: string; href: string; icon: IconSvgElement } =>
      typeof link.href === 'string'
  )

  return (
    <div className="flex flex-col gap-(--space-block)">
      <DetailHeader
        actions={
          <>
            <ShareButton text={tool.summary} title={tool.name} />
            {document ? (
              <OpenInAgentMenu
                filePath={filePath}
                markdown={document.markdown}
                title={tool.name}
              />
            ) : null}
          </>
        }
        available={accessLabels(tool.access)}
        byline={
          <DetailByline
            avatars={[
              { name: company.name, src: company.logo?.url, logo: true },
            ]}
          >
            by{' '}
            <Link
              className="focus-ring rounded-sm text-foreground underline-offset-4 hover:underline"
              href={`/companies/${company.key}`}
            >
              {company.name}
            </Link>
          </DetailByline>
        }
        links={links}
        dates={[`Updated ${DETAIL_DATE.format(tool.updatedAt)}`]}
        description={tool.summary}
        tags={[
          ...(tool.status === 'deprecated'
            ? [{ label: 'Deprecated', emphasis: true }]
            : []),
          ...capabilities.map((capability) => ({
            label: capability.label,
            href: `/tools?capability=${capability.slug}`,
          })),
        ]}
        title={tool.name}
        titleBadge={<AgentReadiness level={tool.agent.level} />}
      />

      <div className="flex min-w-0 flex-col gap-(--space-block)">
        <DescriptionSection entity="tool" text={tool.description} />
        <section className="flex flex-col gap-(--space-md)">
          {document ? (
            <MarkdownFile
              fileName={filePath.split('/').pop() ?? 'tool.md'}
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
        <ToolAccessPanel tool={tool} />
      </div>

      <section className="flex flex-col gap-(--space-md)">
        <h2 className={PANEL_HEADING}>Workflows using {tool.name}</h2>
        {workflows.length === 0 ? (
          <NoResults
            description={`No published workflow uses ${tool.name} yet.`}
            entity="workflow"
            title="No workflows yet"
          />
        ) : (
          <CatalogList items={workflows.map(workflowListItem)} />
        )}
      </section>
    </div>
  )
}
