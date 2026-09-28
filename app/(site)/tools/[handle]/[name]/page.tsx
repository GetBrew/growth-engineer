import type { IconSvgElement } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { CatalogList, workflowListItem } from '@/components/catalog/list'
import { accessLabels } from '@/components/common/badges'
import { NoResults } from '@/components/common/no-results'
import { CopyFileButton } from '@/components/detail/copy-file-button'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/detail/header'
import { MarkdownFile } from '@/components/detail/markdown-file'
import { MarkdownPreview } from '@/components/detail/markdown-preview'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { LINK_ICON, PANEL_HEADING } from '@/components/detail/styles'
import { ToolAccessPanel } from '@/components/detail/tool-access-panel'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { isValidOwnedKey, refToFilePath, refToPath } from '@/lib/catalog/keys'
import {
  loadDocument,
  loadTool,
  loadWorkflowsByTool,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { toolParams } from '@/lib/catalog/static-params'
import { toolDocsUrl } from '@/lib/catalog/tool-docs'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { toolJsonLd } from '@/lib/seo/structured-data'

type Params = Promise<{ handle: string; name: string }>

async function keyFrom(params: Params): Promise<string | null> {
  const { handle, name } = await params
  const key = `${handle}/${name}`
  return isValidOwnedKey(key) ? key : null
}

/**
 * Every page here is prerendered from `generateStaticParams`, and reading
 * `params` outside `<Suspense>` is deliberate: nothing loads. So navigating
 * here may block rather than show a fallback; `instant = false` says so.
 */
export const instant = false

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
  }
  return pageMetadata({
    title: `${result.tool.name} by ${result.company.name}`,
    description: result.tool.summary,
    path: refToPath(ref),
    file: refToFilePath(ref),
  })
}

export default async function ToolPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/tools" label="All tools" />
      <ToolDetail params={params} />
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
  // Every tool in the catalog has a file; a missing one is no page.
  if (!document) {
    notFound()
  }
  const { tool, company, capabilities } = result
  // The file's date: the tool's, its company's and its workflows', newest.
  const updatedAt = document.updatedAt
  const filePath = refToFilePath({
    type: 'tool',
    key: tool.key,
  })

  const docsUrl = toolDocsUrl(tool)

  const links = [
    { label: 'Website', href: company.links.website, icon: LINK_ICON.website },
    { label: 'Docs', href: docsUrl, icon: LINK_ICON.docs },
  ].filter(
    (link): link is { label: string; href: string; icon: IconSvgElement } =>
      typeof link.href === 'string'
  )

  return (
    <div className="flex flex-col gap-(--space-block)">
      <JsonLd data={toolJsonLd(SITE_ORIGIN, tool, company, updatedAt)} />
      <DetailHeader
        actions={
          <>
            <ShareButton text={tool.summary} title={tool.name} />
            <ViewSourceButton entityKey={tool.key} type="tool" />
            <OpenInAgentMenu
              filePath={filePath}
              fileUrl={`${SITE_ORIGIN}${filePath}`}
              markdown={document.markdown}
              title={tool.name}
            />
            <CopyFileButton label="Copy tool" markdown={document.markdown} />
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
        dates={[`Updated ${DETAIL_DATE.format(updatedAt)}`]}
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

      <div className="flex min-w-0 flex-col gap-(--space-block)">
        <section className="flex flex-col gap-(--space-md)">
          <MarkdownFile
            fileName={filePath.split('/').pop() ?? 'tool.md'}
            markdown={document.markdown}
            preview={<MarkdownPreview markdown={document.markdown} />}
          />
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
