import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { accessLabels } from '@/components/catalog/badges'
import {
  CatalogList,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import { DescriptionSection } from '@/components/catalog/description-section'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/catalog/detail-header'
import { NoResults } from '@/components/catalog/no-results'
import { Page } from '@/components/catalog/primitives'
import { ToolAccessPanel } from '@/components/catalog/tool-access-panel'
import { MarkdownFile } from '@/components/document/markdown-file'
import { OpenInAgentMenu } from '@/components/document/open-in-agent-menu'
import { ShareButton } from '@/components/document/share-button'
import { JsonLd } from '@/components/seo/json-ld'
import { MaskIcon } from '@/components/site/mask-icon'
import { ToolDetailSkeleton } from '@/components/skeletons/tool-detail-skeleton'
import { isValidOwnedKey, refToFilePath, refToPath } from '@/lib/catalog/keys'
import {
  loadDocument,
  loadTool,
  loadWorkflowsByTool,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { toolParams } from '@/lib/catalog/static-params'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { toolJsonLd } from '@/lib/seo/structured-data'

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
  if (!result) {
    return {}
  }
  const ref = {
    type: 'tool' as const,
    key: result.tool.key,
    version: undefined,
  }
  return pageMetadata({
    title: `${result.tool.name} by ${result.company.name}`,
    description: result.tool.summary,
    path: refToPath(ref),
    file: refToFilePath(ref),
  })
}

/**
 * The tool page does one job: show the file and make it easy to copy.
 * Workflows using the tool sit below it.
 */
export default function ToolPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-8">
      <Link
        className="type-control w-fit text-subtle transition-colors hover:text-foreground"
        href="/tools"
      >
        ← All tools
      </Link>
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
    // An old key answers with a real redirect; an unknown one is a 404.
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
    ['Website', company.links.website],
    ['Docs', docsUrl],
  ].filter((entry): entry is [string, string] => typeof entry[1] === 'string')

  return (
    <div className="flex flex-col gap-10">
      <JsonLd data={toolJsonLd(SITE_ORIGIN, tool, company)} />
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
              className="text-foreground hover:underline"
              href={`/companies/${company.key}`}
            >
              {company.name}
            </Link>
          </DetailByline>
        }
        links={links.map(([label, href]) => ({ label, href }))}
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
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-14">
          <DescriptionSection icon="/tool.svg" text={tool.description} />
          <section className="flex flex-col gap-5">
            <h2 className="type-section">Ready-to-use markdown</h2>
            {document ? (
              <MarkdownFile
                fileName={filePath.split('/').pop() ?? 'tool.md'}
                markdown={document.markdown}
              />
            ) : (
              <p className="type-body rounded-2xl border border-dashed px-6 py-10 text-center">
                The file for this tool has not been rendered yet.
              </p>
            )}
          </section>
        </div>
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <ToolAccessPanel tool={tool} />
        </aside>
      </div>

      <div className="flex flex-col gap-14">
        <section className="flex flex-col gap-5">
          <h2 className="type-section">Workflows using {tool.name}</h2>
          {workflows.length === 0 ? (
            <NoResults
              description={`No published workflow uses ${tool.name} yet.`}
              icon={<MaskIcon size={20} src="/workflow.svg" />}
              title="No workflows yet"
            />
          ) : (
            <CatalogList items={workflows.map(workflowListItem)} />
          )}
        </section>
      </div>
    </div>
  )
}
