import { File01Icon } from '@hugeicons/core-free-icons'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { accessTypeLabels } from '@/components/common/badges'
import { NoResults } from '@/components/common/no-results'
import { BuiltFrom } from '@/components/detail/built-from'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/detail/header'
import { HowItRuns } from '@/components/detail/how-it-runs'
import { MarkdownFile } from '@/components/detail/markdown-file'
import { MarkdownPreview } from '@/components/detail/markdown-preview'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { MaskIcon } from '@/components/layout/mask-icon'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { isValidKeyPart, refToFilePath, refToPath } from '@/lib/catalog/keys'
import { loadDocument, loadWorkflow, resolveAlias } from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'
import { SITE_ORIGIN } from '@/lib/env'
import { githubAvatarUrl, githubProfileUrl } from '@/lib/github'
import { pageMetadata } from '@/lib/seo/metadata'
import { workflowJsonLd } from '@/lib/seo/structured-data'

type Params = Promise<{ name: string }>

async function resolveKey(params: Params): Promise<string | null> {
  const { name } = await params
  const key = decodeURIComponent(name)
  return isValidKeyPart(key) ? key : null
}

export function generateStaticParams() {
  return workflowParams()
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const key = await resolveKey(params)
  const result = key ? await loadWorkflow(key) : null
  if (!result) {
    return {}
  }
  const ref = {
    type: 'workflow' as const,
    key: result.workflow.key,
  }
  return pageMetadata({
    title: result.workflow.title,
    description: result.workflow.summary,
    path: refToPath(ref),
    file: refToFilePath(ref),
    type: 'article',
  })
}

export default async function WorkflowPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/workflows" label="All workflows" />
      <WorkflowDetail params={params} />
    </Page>
  )
}

async function WorkflowDetail({ params }: { params: Params }) {
  const key = await resolveKey(params)
  if (!key) {
    notFound()
  }
  const [result, document] = await Promise.all([
    loadWorkflow(key),
    loadDocument('workflow', key),
  ])
  if (!result) {
    const alias = await resolveAlias('workflow', key)
    if (alias) {
      permanentRedirect(refToPath({ type: 'workflow', key: alias.key }))
    }
    notFound()
  }

  const { workflow, updatedAt, tools, tags } = result
  const filePath = refToFilePath({ type: 'workflow', key: workflow.key })

  const dates = [`Updated ${DETAIL_DATE.format(updatedAt)}`]

  const author = {
    name: workflow.author,
    avatar: githubAvatarUrl(workflow.author),
    href: githubProfileUrl(workflow.author),
  }
  const available = accessTypeLabels(
    tools.flatMap(({ tool }) => tool.access.map((entry) => entry.type))
  )

  return (
    <div className="flex flex-col gap-(--space-block)">
      <JsonLd data={workflowJsonLd(SITE_ORIGIN, workflow, tools, updatedAt)} />
      <DetailHeader
        actions={
          <>
            <ShareButton text={workflow.summary} title={workflow.title} />
            <ViewSourceButton entityKey={workflow.key} type="workflow" />
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
        tags={[
          ...(workflow.status === 'deprecated'
            ? [{ label: 'Deprecated', emphasis: true }]
            : []),
          ...tags.map((tag) => ({
            label: tag.label,
            href: `/workflows?tag=${encodeURIComponent(tag.key)}`,
          })),
        ]}
        title={workflow.title}
      />

      <div className="grid gap-(--space-block) lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="flex min-w-0 flex-col gap-(--space-md)">
          {document ? (
            <>
              <MarkdownFile
                fileName={filePath.split('/').pop() ?? 'workflow.md'}
                markdown={document.markdown}
                preview={<MarkdownPreview markdown={document.markdown} />}
              />
              <BuiltFrom sources={document.sources} />
            </>
          ) : (
            <NoResults
              description="It appears here as soon as the catalog renders it."
              icon={File01Icon}
              title="No file yet"
              variant="card"
            />
          )}
        </section>

        <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <HowItRuns
            steps={workflow.steps}
            tools={tools.map(({ tool, company }) => ({
              key: tool.key,
              name: tool.name,
              logoUrl: company.logo?.url,
              access: [...new Set(tool.access.map((entry) => entry.type))],
            }))}
          />
        </aside>
      </div>
    </div>
  )
}
