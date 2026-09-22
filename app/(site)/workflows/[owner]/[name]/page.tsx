import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { accessTypeLabels } from '@/components/catalog/badges'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/catalog/detail-header'
import { Page } from '@/components/catalog/primitives'
import { MarkdownFile } from '@/components/document/markdown-file'
import { OpenInAgentMenu } from '@/components/document/open-in-agent-menu'
import { ShareButton } from '@/components/document/share-button'
import { WorkflowDetailSkeleton } from '@/components/skeletons/workflow-detail-skeleton'
import { HowItRuns } from '@/components/workflows/how-it-runs'
import {
  isValidOwnedKey,
  refToFilePath,
  refToPath,
  splitVersionedKey,
} from '@/lib/catalog/keys'
import {
  loadCompany,
  loadDocument,
  loadWorkflow,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { workflowParams } from '@/lib/catalog/static-params'

type Params = Promise<{ owner: string; name: string }>

const PANEL_HEADING = 'type-section'

async function resolveParams(params: Params) {
  const { owner, name } = await params
  const { key: unversioned, version } = splitVersionedKey(
    decodeURIComponent(name)
  )
  const key = `${owner}/${unversioned}`
  return isValidOwnedKey(key) ? { key, version } : null
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
  const owner = resolved.key.split('/')[0] ?? ''
  const [result, document, ownerCompany] = await Promise.all([
    loadWorkflow(resolved.key, resolved.version),
    loadDocument('workflow', resolved.key),
    loadCompany(owner),
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

  const { workflow, version, tools, tags } = result
  const ref = {
    type: 'workflow' as const,
    key: workflow.key,
    version: resolved.version,
  }
  const filePath = refToFilePath(ref)
  // The file's date: the newest of the workflow and the tools it uses.
  const dates = [`Updated ${DETAIL_DATE.format(version.updatedAt)}`]
  // The owner is the handle in the key; a company handle links to its page.
  const author = ownerCompany
    ? {
        name: ownerCompany.name,
        logo: ownerCompany.logo?.url,
        href: `/companies/${owner}`,
      }
    : { name: owner, logo: undefined, href: undefined }
  const available = accessTypeLabels(
    tools.flatMap(({ tool }) => tool.access.map((entry) => entry.type))
  )

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
        available={available}
        byline={
          <DetailByline
            avatars={[{ name: author.name, src: author.logo, logo: true }]}
          >
            by{' '}
            {author.href ? (
              <Link
                className="text-foreground hover:underline"
                href={author.href}
              >
                {author.name}
              </Link>
            ) : (
              <span className="text-foreground">{author.name}</span>
            )}
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
