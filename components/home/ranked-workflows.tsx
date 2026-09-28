import { CopyMetric } from '@/components/catalog/copy-metric'
import { CatalogList, workflowListItem } from '@/components/catalog/list'
import { loadWorkflows } from '@/lib/catalog/loaders'
import { loadCopyStats } from '@/lib/usage/copies'
import {
  angleValue,
  COPY_ANGLES,
  type CopyAngle,
  rankByAngle,
  statsFor,
} from '@/lib/usage/stats'

const EMPTY: Record<CopyAngle, string> = {
  hot: 'Nothing has been copied this week yet.',
  popular: 'Nothing has been copied yet.',
}

/**
 * The home page's Hot or Popular workflows: the most copied this week, or
 * ever, each with its count. Read at request time, so render it inside
 * `<Suspense>`. Only workflows with copies on the angle are listed.
 */
export async function RankedWorkflows({
  angle,
  limit,
}: {
  angle: CopyAngle
  limit: number
}) {
  const stats = await loadCopyStats()
  if (!stats) {
    return <p className="type-body py-6">Counts are unavailable right now.</p>
  }
  const rows = rankByAngle(
    loadWorkflows('featured', Number.POSITIVE_INFINITY),
    (row) => row.workflow.key,
    stats,
    angle
  )
    .map((row) => ({
      row,
      value: angleValue(statsFor(stats, row.workflow.key), angle),
    }))
    .filter(({ value }) => value > 0)
    .slice(0, limit)

  if (rows.length === 0) {
    return <p className="type-body py-6">{EMPTY[angle]}</p>
  }
  return (
    <CatalogList
      all={{
        href: `/workflows?sort=${angle}`,
        label: `View all ${COPY_ANGLES[angle].label.toLowerCase()} workflows`,
      }}
      items={rows.map(({ row, value }) => ({
        ...workflowListItem(row),
        metric: <CopyMetric angle={angle} value={value} />,
      }))}
    />
  )
}

/** One workflow's copies, all time, streamed into its list row. */
export async function WorkflowCopies({ workflowKey }: { workflowKey: string }) {
  const stats = await loadCopyStats()
  return stats ? (
    <CopyMetric angle="popular" value={statsFor(stats, workflowKey).total} />
  ) : null
}
