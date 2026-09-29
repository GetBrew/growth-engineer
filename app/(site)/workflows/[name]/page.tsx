import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  CopyCountProvider,
  UsesStatFallback,
} from '@/components/detail/copy-count'
import { CopyFileButton } from '@/components/detail/copy-file-button'
import { GetStarted } from '@/components/detail/get-started'
import { DetailByline, DetailHeader } from '@/components/detail/header'
import { HowItRuns } from '@/components/detail/how-it-runs'
import { MarkdownFile } from '@/components/detail/markdown-file'
import { MarkdownPreview } from '@/components/detail/markdown-preview'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { PANEL_HEADING } from '@/components/detail/styles'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import {
  WorkflowInputs,
  WorkflowOutcome,
} from '@/components/detail/workflow-brief'
import { WorkflowUses } from '@/components/detail/workflow-uses'
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
import { hasCopyCounter } from '@/lib/usage/copies'
import { cn } from '@/lib/utils/cn'

type Params = Promise<{ name: string }>

async function resolveKey(params: Params): Promise<string | null> {
  const { name } = await params
  return isValidKeyPart(name) ? name : null
}

/**
 * Every page here is prerendered from `generateStaticParams`, and reading
 * `params` outside `<Suspense>` is deliberate: nothing loads — only the copy
 * count streams into its hole. So navigating here may block rather than show
 * a fallback; `instant = false` says so.
 */
export const instant = false

export function generateStaticParams() {
  return workflowParams()
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const key = await resolveKey(params)
  const result = key ? loadWorkflow(key) : null
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

export default function WorkflowPage({ params }: { params: Params }) {
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
  const [result, document] = [loadWorkflow(key), loadDocument('workflow', key)]
  if (!result) {
    const alias = resolveAlias('workflow', key)
    if (alias) {
      permanentRedirect(refToPath({ type: 'workflow', key: alias.key }))
    }
    notFound()
  }
  // Every workflow in the catalog has a file; a missing one is no page.
  if (!document) {
    notFound()
  }

  const { workflow, updatedAt, tools, tags } = result
  const filePath = refToFilePath({ type: 'workflow', key: workflow.key })
  const isCounting = hasCopyCounter()
  const motion =
    tags.find((tag) => tag.key === `motion:${workflow.motion}`)?.label ??
    workflow.motion
  // The companies whose tools the steps use, once each, in first-use order.
  const companies = [
    ...new Map(
      tools.map(({ company }) => [
        company.key,
        { key: company.key, name: company.name },
      ])
    ).values(),
  ]

  const author = {
    name: workflow.author,
    avatar: githubAvatarUrl(workflow.author),
    href: githubProfileUrl(workflow.author),
  }

  return (
    <div className="flex flex-col gap-(--space-block)">
      <JsonLd
        data={workflowJsonLd(SITE_ORIGIN, workflow, tools, updatedAt, motion)}
      />
      <DetailHeader
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
        description={workflow.summary}
        // One sentence of 140 characters at most: shown whole.
        shouldClampDescription={false}
        tags={[
          ...(workflow.status === 'deprecated'
            ? [{ label: 'Deprecated', emphasis: true }]
            : []),
          { label: motion, href: `/workflows?motion=${workflow.motion}` },
        ]}
        title={workflow.title}
      />

      {/* The side column comes first in the page, so focus follows what a
          phone shows: the actions, then the brief. From lg the grid places
          it on the right, where it stays in view. */}
      <div className="grid gap-(--space-block) lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <CopyCountProvider isCounting={isCounting} workflowKey={workflow.key}>
          <aside className="flex flex-col gap-(--space-xl) lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-start-2 lg:row-start-1">
            {/* One row under lg, Copy taking the rest of it; from lg, Copy
                spans the column and the others sit on the line below. */}
            <div className="flex flex-wrap items-center gap-2">
              <CopyFileButton
                className="order-last flex-1 lg:order-first lg:basis-full"
                label="Copy workflow"
                noun="Workflow"
                markdown={document.markdown}
              />
              {/* Under lg the icons lead the row (their padding bleeds left
                  to line up with the edge); from lg they sit centred under
                  the full-width Copy button. */}
              <div className="-ml-3 flex items-center lg:ml-0 lg:basis-full lg:justify-center">
                <ShareButton text={workflow.summary} title={workflow.title} />
                <ViewSourceButton entityKey={workflow.key} type="workflow" />
                <OpenInAgentMenu
                  filePath={filePath}
                  fileUrl={`${SITE_ORIGIN}${filePath}`}
                  markdown={document.markdown}
                  title={workflow.title}
                />
              </div>
            </div>
            {/* The one part read at request time: the rest of the page is
                prerendered, and the count streams into this hole. */}
            {isCounting ? (
              <Suspense fallback={<UsesStatFallback />}>
                <WorkflowUses workflowKey={workflow.key} />
              </Suspense>
            ) : null}
            <GetStarted
              companies={companies}
              questions={workflow.inputs.length}
            />
          </aside>
        </CopyCountProvider>

        {/* The brief a person reads first; the file the agent runs is one
            click away, and it is what Copy copies. */}
        <div className="flex min-w-0 flex-col gap-(--space-block) lg:col-start-1 lg:row-start-1">
          <WorkflowOutcome outcome={workflow.outcome} />
          <HowItRuns
            steps={workflow.steps}
            tools={tools.map(({ tool, company }) => ({
              key: tool.key,
              name: tool.name,
              companyName: company.name,
              logoUrl: company.logo?.url,
            }))}
          />
          <WorkflowInputs inputs={workflow.inputs} />
          <details className="group flex flex-col gap-3">
            <summary
              className={cn(
                PANEL_HEADING,
                'focus-ring cursor-pointer list-none gap-2 rounded-md [&::-webkit-details-marker]:hidden'
              )}
            >
              The file your agent runs
              <HugeiconsIcon
                aria-hidden="true"
                className="text-soft transition-transform duration-200 group-open:rotate-180"
                icon={ArrowDown01Icon}
                size={16}
                strokeWidth={1.8}
              />
            </summary>
            <div className="mt-3">
              <MarkdownFile
                fileName={filePath.split('/').pop() ?? 'workflow.md'}
                markdown={document.markdown}
                preview={<MarkdownPreview markdown={document.markdown} />}
              />
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
