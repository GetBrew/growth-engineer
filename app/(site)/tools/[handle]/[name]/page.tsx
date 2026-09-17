import { isValidOwnedKey, refToFilePath } from '@convex/model/keys'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { AccessBadges, AgentLevelBadge } from '@/components/catalog/badges'
import { WorkflowRow } from '@/components/catalog/cards'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { EmptyState, Page } from '@/components/catalog/primitives'
import {
  DocumentSkeleton,
  HeaderSkeleton,
} from '@/components/catalog/skeletons'
import { DocumentViewer } from '@/components/document/document-viewer'
import { Badge } from '@/components/ui/badge'
import {
  loadDocument,
  loadTool,
  loadWorkflowsByTool,
  resolveAlias,
} from '@/lib/catalog/loaders'

type Params = Promise<{ handle: string; name: string }>

async function keyFrom(params: Params): Promise<string | null> {
  const { handle, name } = await params
  const key = `${handle}/${name}`
  return isValidOwnedKey(key) ? key : null
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

/**
 * The tool page does one job: show the file and make it easy to copy.
 * Workflows using the tool sit below it.
 */
export default function ToolPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-10">
      <Suspense
        fallback={
          <div className="flex flex-col gap-10">
            <HeaderSkeleton />
            <DocumentSkeleton />
          </div>
        }
      >
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

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 border-border border-b pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <EntityLogo
            logoUrl={company.logo?.url}
            name={company.name}
            size={56}
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-3xl tracking-[-0.04em] sm:text-4xl">
                {tool.name}
              </h1>
              <p className="text-foreground/62 text-sm">
                by{' '}
                <Link
                  className="text-foreground hover:underline"
                  href={`/companies/${company.key}`}
                >
                  {company.name}
                </Link>
              </p>
            </div>
            <p className="max-w-2xl text-base text-foreground/70 leading-7">
              {tool.summary}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <AgentLevelBadge
                level={tool.agent.level}
                reason={tool.agent.reason}
              />
              <AccessBadges access={tool.access} />
              {tool.status === 'deprecated' ? (
                <Badge variant="workflow">
                  <AlertTriangle aria-hidden="true" className="size-3" />{' '}
                  Deprecated
                </Badge>
              ) : null}
            </div>
            <p className="text-foreground/55 text-xs">{tool.agent.reason}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {company.links.website ? (
            <a
              className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm transition-colors hover:border-foreground/20"
              href={company.links.website}
              rel="noreferrer"
              target="_blank"
            >
              Website <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
          {tool.access.find((access) => access.docsUrl)?.docsUrl ? (
            <a
              className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm transition-colors hover:border-foreground/20"
              href={tool.access.find((access) => access.docsUrl)?.docsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Docs <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </header>

      {document ? (
        <DocumentViewer
          filePath={filePath}
          lineCount={document.lineCount}
          markdown={document.markdown}
          title={tool.name}
        />
      ) : (
        <EmptyState title="The file for this tool has not been rendered yet." />
      )}

      {capabilities.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl tracking-[-0.025em]">
            What it can do
          </h2>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <Link
                className="focus-ring inline-flex h-8 items-center rounded-full border border-tag/40 bg-tag/5 px-3 text-sm text-tag transition-colors hover:border-tag"
                href={`/tools?capability=${capability.slug}`}
                key={capability.slug}
              >
                {capability.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl tracking-[-0.025em]">
          Workflows using {tool.name}
        </h2>
        {workflows.length === 0 ? (
          <EmptyState title={`No published workflow uses ${tool.name} yet`} />
        ) : (
          <div className="flex flex-col border-border border-t">
            {workflows.map((row) => (
              <WorkflowRow key={row.workflow._id} {...row} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
