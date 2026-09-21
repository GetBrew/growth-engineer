import {
  isValidOwnedKey,
  refToFilePath,
  refToPath,
  splitVersionedKey,
} from '@convex/model/keys'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { DescriptionSection } from '@/components/catalog/description-section'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
  PLACEHOLDER_DESCRIPTION,
  PLACEHOLDER_STATS,
  PLACEHOLDER_USED_BY,
} from '@/components/catalog/detail-header'
import { Page } from '@/components/catalog/primitives'
import { MarkdownFile } from '@/components/document/markdown-file'
import { OpenInAgentMenu } from '@/components/document/open-in-agent-menu'
import { ShareButton } from '@/components/document/share-button'
import { WorkflowDetailSkeleton } from '@/components/skeletons/workflow-detail-skeleton'
import { HowItRuns } from '@/components/workflows/how-it-runs'
import { loadDocument, loadWorkflow, resolveAlias } from '@/lib/catalog/loaders'

type Params = Promise<{ owner: string; name: string }>

const PANEL_HEADING = 'type-section'

/** Placeholder until workflows record who made them. */
const CREATOR = {
  person: { name: 'Thomas Park', avatar: '/one.svg' },
  company: { name: 'Brew', logo: '/logos/brew.svg' },
}

const TAGS = ['Funding signal', 'Email', 'Enrichment']
const AVAILABLE_AS = ['API', 'CLI', 'MCP']

async function resolveParams(params: Params) {
  const { owner, name } = await params
  const { key: unversioned, version } = splitVersionedKey(
    decodeURIComponent(name)
  )
  const key = `${owner}/${unversioned}`
  return isValidOwnedKey(key) ? { key, version } : null
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

  const { workflow, version, tools, versions } = result
  const ref = {
    type: 'workflow' as const,
    key: workflow.key,
    version: resolved.version,
  }
  const filePath = refToFilePath(ref)
  const isCurrent = version._id === workflow.currentVersionId
  // "Published" is when the workflow went live; "Updated" is when the version
  // shown was saved, and is only worth saying when it is a different day.
  const updatedAt = versions.find(
    (entry) => entry.version === version.version
  )?.createdAt
  const publishedDay = workflow.publishedAt
    ? DETAIL_DATE.format(workflow.publishedAt)
    : null
  const updatedDay = updatedAt ? DETAIL_DATE.format(updatedAt) : null
  const dates = [
    publishedDay ? `Published ${publishedDay}` : null,
    updatedDay && updatedDay !== publishedDay ? `Updated ${updatedDay}` : null,
  ].filter((date): date is string => date !== null)

  return (
    <div className="flex flex-col gap-10">
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
        available={AVAILABLE_AS}
        byline={
          <DetailByline
            avatars={[
              { name: CREATOR.person.name, src: CREATOR.person.avatar },
              {
                name: CREATOR.company.name,
                src: CREATOR.company.logo,
                logo: true,
              },
            ]}
          >
            Created by{' '}
            <span className="text-foreground">{CREATOR.person.name}</span> (
            {CREATOR.company.name})
          </DetailByline>
        }
        dates={dates}
        description={workflow.summary}
        stats={PLACEHOLDER_STATS}
        tags={[
          {
            label: `v${version.version}${isCurrent ? '' : ' · not current'}`,
            emphasis: true,
          },
          ...TAGS.map((tag) => ({ label: tag })),
        ]}
        title={workflow.title}
        usedBy={PLACEHOLDER_USED_BY}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-14">
          {/* Workflows have no description field yet: the placeholder. */}
          <DescriptionSection
            icon="/workflow.svg"
            text={PLACEHOLDER_DESCRIPTION}
          />
          <section className="flex flex-col gap-5">
            <h2 className={PANEL_HEADING}>Ready-to-use markdown</h2>
            {isCurrent ? null : (
              <p className="type-body rounded-2xl border bg-surface px-4 py-3">
                v{version.version} is not the current version. The file below is
                the current one; older versions are frozen in history but their
                files are not stored yet.
              </p>
            )}
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
