import type { Metadata } from 'next'
import { Suspense } from 'react'
import { EmptyState } from '@/components/layout/empty-state'
import { Page } from '@/components/layout/page'
import { SectionHeading } from '@/components/layout/section-heading'
import { MapSkeleton } from '@/components/map/focused'
import { NodePill } from '@/components/map/node'
import { loadMapOverview } from '@/lib/catalog/loaders'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Relationship map',
  description:
    'How the catalog connects: which company makes a tool, which workflows use it, and what every entity is tagged.',
  path: '/map',
})

const SECTION_TITLE = {
  company: 'Companies',
  tool: 'Tools',
  workflow: 'Workflows',
} as const

export default function MapPage() {
  return (
    <Page className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        description="What is connected to what. Every company, tool and workflow, with the edges between them — the one view the catalog pages do not give you."
        title="Relationship map"
      />
      <Suspense fallback={<MapSkeleton />}>
        <Overview />
      </Suspense>
    </Page>
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
    <div className="flex flex-col gap-(--space-2xl)">
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
        <section className="flex flex-col gap-(--space-xs)" key={type}>
          <div className="flex items-baseline gap-3">
            <h2 className="type-category">{SECTION_TITLE[type]}</h2>
            <span className="type-meta">{byType[type].length}</span>
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
          hint="Add a company under companies/ and open a pull request."
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
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6">
      <div className="flex flex-col gap-1">
        <h2 className="type-subsection">{title}</h2>
        <p className="type-meta">{caption}</p>
      </div>
      <dl className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div
            className="flex items-baseline justify-between gap-4 border-border border-b pb-2 last:border-0 last:pb-0"
            key={label}
          >
            <dt className="type-helper text-subtle">{label}</dt>
            <dd className="type-field-label font-mono tabular-nums">
              {value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
