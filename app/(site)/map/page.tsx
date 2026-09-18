import { parseRef } from '@convex/model/keys'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import {
  EmptyState,
  Page,
  SectionHeading,
} from '@/components/catalog/primitives'
import { NeighborhoodGraph } from '@/components/map/graph'
import { catalogHref, NodePill } from '@/components/map/node'
import { RelationGroups } from '@/components/map/relations'
import { loadMapOverview, loadNeighborhood } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Relationship map',
  description:
    'How the catalog connects: which company makes a tool, which workflows use it, and what every entity is tagged.',
}

type SearchParams = Promise<{ focus?: string | Array<string> }>

const SECTION_TITLE = {
  company: 'Companies',
  tool: 'Tools',
  workflow: 'Workflows',
} as const

/**
 * The relationship map. READ-ONLY by construction — it calls two `publicQuery`
 * functions and there is no mutation on this page, so it needs no session and
 * exposes nothing that is not already on a catalog page.
 *
 * The URL is the state (`?focus=tool:clay/clay`), so a view is shareable, an
 * agent can drive it, and there is no client-side graph state to get out of
 * sync with the address bar. The shell is synchronous and the reads live in
 * the Suspense child, per the rendering contract in AGENTS.md.
 */
export default function MapPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <Page className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        description="What is connected to what. Every company, tool and workflow, with the edges between them — the one view the catalog pages do not give you."
        title="Relationship map"
      />
      <Suspense fallback={<MapSkeleton />}>
        <MapView searchParams={searchParams} />
      </Suspense>
    </Page>
  )
}

function MapSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[520px] w-full animate-pulse rounded-2xl bg-muted"
    />
  )
}

async function MapView({ searchParams }: { searchParams: SearchParams }) {
  await connection()
  const params = await searchParams
  const raw = Array.isArray(params.focus) ? params.focus[0] : params.focus
  const ref = raw ? parseRef(raw) : null

  if (!ref) {
    return <Overview />
  }
  return <Focused refKey={ref.key} refType={ref.type} />
}

async function Focused({
  refType,
  refKey,
}: {
  refType: 'company' | 'tool' | 'workflow'
  refKey: string
}) {
  const result = await loadNeighborhood(refType, refKey)
  if (!result) {
    return (
      <EmptyState
        hint="The key may have been renamed. Clear the focus to see the whole map."
        title={`Nothing in the map for ${refType}:${refKey}`}
      />
    )
  }
  const { node, groups } = result
  const edges = groups.reduce((total, group) => total + group.nodes.length, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-foreground/55 text-sm">
            {node.type} · {edges} {edges === 1 ? 'edge' : 'edges'}
          </p>
          <h2 className="truncate font-semibold text-2xl tracking-[-0.02em]">
            {node.name}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="focus-ring flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-foreground/62 text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
            href={catalogHref(node)}
          >
            Open page
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            className="focus-ring flex h-10 items-center rounded-full border border-border bg-white px-4 text-foreground/62 text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
            href="/map"
          >
            Whole map
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-2 sm:p-4">
        <NeighborhoodGraph groups={groups} node={node} />
      </div>

      <RelationGroups groups={groups} />
    </div>
  )
}

async function Overview() {
  const { counts, isTruncated, nodes } = await loadMapOverview()

  const nodeStats = [
    ['Companies', counts.companies],
    ['Tools', counts.tools],
    ['Workflows', counts.workflows],
    ['Tags', counts.tags],
  ] as const

  const edgeStats = [
    ['tool → company', counts.toolCompanyEdges],
    ['workflow → tool', counts.workflowToolEdges],
    ['entity → tag', counts.taggingEdges],
    ['workflow → version', counts.versionEdges],
    ['old key → entity', counts.aliasEdges],
  ] as const

  const byType = {
    company: nodes.filter((node) => node.type === 'company'),
    tool: nodes.filter((node) => node.type === 'tool'),
    workflow: nodes.filter((node) => node.type === 'workflow'),
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatCard
          caption="Everything the map can draw."
          rows={nodeStats}
          title="Nodes"
        />
        <StatCard
          caption={
            isTruncated
              ? 'Counting stops at 1,000 rows per table — these are floors, not totals.'
              : 'Every edge in the catalog, counted exactly.'
          }
          rows={edgeStats}
          title="Edges"
        />
      </div>

      {(['company', 'tool', 'workflow'] as const).map((type) => (
        <section className="flex flex-col gap-3" key={type}>
          <div className="flex items-baseline gap-3">
            <h2 className="font-semibold text-lg tracking-[-0.02em]">
              {SECTION_TITLE[type]}
            </h2>
            <span className="font-medium text-foreground/45 text-xs">
              {byType[type].length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {byType[type].map((node) => (
              <NodePill key={`${node.type}:${node.key}`} node={node} />
            ))}
          </div>
        </section>
      ))}

      {nodes.length === 0 ? (
        <EmptyState
          hint="Run `pnpm seed` to load the illustrative catalog."
          title="The catalog is empty"
        />
      ) : null}
    </div>
  )
}

function StatCard({
  title,
  caption,
  rows,
}: {
  title: string
  caption: string
  rows: ReadonlyArray<readonly [string, number]>
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-foreground/55 text-xs leading-5">{caption}</p>
      </div>
      <dl className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div
            className="flex items-baseline justify-between gap-4 border-border border-b pb-2 last:border-0 last:pb-0"
            key={label}
          >
            <dt className="text-foreground/62 text-sm">{label}</dt>
            <dd className="font-medium font-mono text-sm tabular-nums">
              {value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
