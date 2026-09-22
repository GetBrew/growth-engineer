import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { accessTypeLabels } from '@/components/catalog/badges'
import { CatalogList, toolListItem } from '@/components/catalog/catalog-list'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/catalog/detail-header'
import { Page } from '@/components/catalog/primitives'
import { MarkdownFile } from '@/components/document/markdown-file'
import { OpenInAgentMenu } from '@/components/document/open-in-agent-menu'
import { ShareButton } from '@/components/document/share-button'
import { JsonLd } from '@/components/seo/json-ld'
import { WorkflowDetailSkeleton } from '@/components/skeletons/workflow-detail-skeleton'
import { HowItRuns } from '@/components/workflows/how-it-runs'
import {
  isValidKeyPart,
  refToFilePath,
  refToPath,
  splitVersionedKey,
} from '@/lib/catalog/keys'
import { loadDocument, loadWorkflow, resolveAlias } from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { workflowJsonLd } from '@/lib/seo/structured-data'

type Params = Promise<{ name: string }>

const PANEL_HEADING = 'type-section'

/** `/workflows/<name>` or `/workflows/<name>@<version>`: one part, no owner. */
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
  if (!result) {
    return {}
  }
  // A version pin is the same file: its canonical URL is the unpinned one.
  const ref = {
    type: 'workflow' as const,
    key: result.workflow.key,
    version: undefined,
  }
  return pageMetadata({
    title: result.workflow.title,
    description: result.workflow.summary,
    path: refToPath(ref),
    file: refToFilePath(ref),
    type: 'article',
  })
}

export default function WorkflowPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-8">
      <Link
        className="type-control flex w-fit items-center gap-2 text-subtle transition-colors hover:text-foreground"
        href="/workflows"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
        All workflows
      </Link>
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
    // An old key answers with a real redirect; an unknown one is a 404.
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
  // The file's date: the newest of the workflow and the tools it uses.
  const dates = [`Updated ${DETAIL_DATE.format(version.updatedAt)}`]
  // Workflows are by people: the author is a GitHub login, and GitHub serves
  // the avatar for it, so nothing here is invented.
  const author = {
    name: workflow.author,
    avatar: `https://github.com/${encodeURIComponent(workflow.author)}.png?size=96`,
    href: `https://github.com/${encodeURIComponent(workflow.author)}`,
  }
  const available = accessTypeLabels(
    tools.flatMap(({ tool }) => tool.access.map((entry) => entry.type))
  )

  return (
    <div className="flex flex-col gap-10">
      <JsonLd data={workflowJsonLd(SITE_ORIGIN, workflow, tools)} />
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
              className="text-foreground hover:underline"
              href={author.href}
              rel="noreferrer"
              target="_blank"
            >
              @{author.name}
            </a>
          </DetailByline>
        }
        dates={dates}
        description={workflow.summary}
        tags={[
          { label: `v${version.version}`, emphasis: true },
          ...tags.map((tag) => ({
            label: tag.label,
            href: `/workflows?tag=${encodeURIComponent(tag.key)}`,
          })),
        ]}
        title={workflow.title}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-14">
          <section className="flex flex-col gap-5">
            <h2 className={PANEL_HEADING}>Ready-to-use markdown</h2>
            {document ? (
              <MarkdownFile
                fileName={filePath.split('/').pop() ?? 'workflow.md'}
                markdown={document.markdown}
              />
            ) : (
              <p className="type-body rounded-2xl border border-dashed px-6 py-10 text-center">
                The file for this workflow has not been rendered yet.
              </p>
            )}
          </section>
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className={PANEL_HEADING}>Built from</h2>
              <p className="type-body">
                {toolItems.length} {toolItems.length === 1 ? 'tool' : 'tools'},
                each one function of one company. Every tool page lists the
                workflows that use it.
              </p>
            </div>
            <CatalogList items={toolItems.map(toolListItem)} />
          </section>
        </div>
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <HowItRuns
            steps={version.steps}
            tools={tools.map(({ tool, company }) => ({
              key: tool.key,
              name: tool.name,
              logoUrl: company.logo?.url,
            }))}
          />
        </aside>
      </div>
    </div>
  )
}
