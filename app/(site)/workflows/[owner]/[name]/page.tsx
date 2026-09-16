import {
  isValidOwnedKey,
  refToFilePath,
  refToPath,
  splitVersionedKey,
} from '@convex/model/keys'
import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  AccessBadges,
  AgentLevelBadge,
  FormatBadge,
} from '@/components/catalog/badges'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { Page } from '@/components/catalog/primitives'
import {
  DocumentSkeleton,
  HeaderSkeleton,
} from '@/components/catalog/skeletons'
import { DocumentViewer } from '@/components/document/document-viewer'
import { Badge } from '@/components/ui/badge'
import { loadDocument, loadWorkflow, resolveAlias } from '@/lib/catalog/loaders'

type Params = Promise<{ owner: string; name: string }>

/** `/workflows/brew/intent-to-meeting@3` → the key and the pin. */
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

/**
 * The workflow page does one job: show the file and make it easy to copy.
 * Everything else sits below. The shell (breadcrumb, boxes) prerenders; the
 * file streams in.
 */
export default function WorkflowPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-10">
      <Link
        className="text-foreground/60 text-sm transition-colors hover:text-foreground"
        href="/workflows"
      >
        ← All workflows
      </Link>
      <Suspense
        fallback={
          <div className="flex flex-col gap-10">
            <HeaderSkeleton />
            <DocumentSkeleton />
          </div>
        }
      >
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

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 border-border border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <FormatBadge format={workflow.format} />
            <Badge variant="soft">v{version.version}</Badge>
            {workflow.status === 'deprecated' ? (
              <Badge variant="workflow">
                <AlertTriangle aria-hidden="true" className="size-3" />{' '}
                Deprecated
              </Badge>
            ) : null}
            {workflow.moderation === 'pending' ? (
              <Badge variant="soft">Unlisted, awaiting review</Badge>
            ) : null}
          </div>
          <h1 className="text-balance font-semibold text-3xl leading-[1.04] tracking-[-0.04em] sm:text-4xl">
            {workflow.title}
          </h1>
          {workflow.summary ? (
            <p className="max-w-2xl text-base text-foreground/70 leading-7">
              {workflow.summary}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map(({ tool, company }) => (
            <Link
              className="focus-ring flex items-center gap-2 rounded-full border border-border bg-white py-1.5 pr-3 pl-1.5 text-xs transition-colors hover:border-foreground/25"
              href={`/tools/${tool.key}`}
              key={tool._id}
            >
              <EntityLogo
                className="rounded-full"
                logoUrl={company.logo?.url}
                name={company.name}
                size={22}
              />
              <span>{tool.name}</span>
              <AgentLevelBadge
                level={tool.agent.level}
                reason={tool.agent.reason}
              />
            </Link>
          ))}
        </div>
      </header>

      {isCurrent ? null : (
        <p className="rounded-2xl border border-workflow/40 bg-workflow/5 px-4 py-3 text-sm">
          v{version.version} is not the current version. The file below is the
          current one; older versions are frozen in history but their files are
          not stored yet.
        </p>
      )}
      {document ? (
        <DocumentViewer
          filePath={filePath}
          lineCount={document.lineCount}
          markdown={document.markdown}
          title={workflow.title}
        />
      ) : (
        <p className="rounded-2xl border border-border border-dashed px-6 py-10 text-center text-foreground/60 text-sm">
          The file for this workflow has not been rendered yet.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-xl tracking-[-0.025em]">
            Tools in this workflow
          </h2>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {tools.map(({ tool, company }) => (
              <li className="flex items-center gap-4 px-4 py-3" key={tool._id}>
                <EntityLogo
                  logoUrl={company.logo?.url}
                  name={company.name}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    className="font-medium text-[15px] hover:underline"
                    href={`/tools/${tool.key}`}
                  >
                    {tool.name}
                  </Link>
                  <p className="truncate text-foreground/60 text-sm">
                    {tool.summary}
                  </p>
                </div>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <AccessBadges access={tool.access} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-4">
          <h2 className="font-semibold text-xl tracking-[-0.025em]">
            Versions
          </h2>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {versions.map((entry) => (
              <li
                className="flex items-center justify-between px-4 py-3 text-sm"
                key={entry._id}
              >
                <Link
                  className={
                    entry.version === version.version
                      ? 'font-medium'
                      : 'text-foreground/70 hover:underline'
                  }
                  href={refToPath({
                    type: 'workflow',
                    key: workflow.key,
                    version: entry.version,
                  })}
                >
                  v{entry.version}
                </Link>
                <span className="text-foreground/50 text-xs">
                  {new Date(entry.createdAt).toISOString().slice(0, 10)}
                  {entry.scanStatus === 'flagged' ? ' · flagged' : ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-foreground/55 text-xs leading-5">
            Versions are frozen once saved. Edits create the next one; the file
            header names the version it was rendered from.
          </p>
        </aside>
      </div>
    </div>
  )
}
