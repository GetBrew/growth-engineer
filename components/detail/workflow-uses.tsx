import { UsesStat } from '@/components/detail/copy-count'
import { loadCopyStats } from '@/lib/usage/copies'
import { placeOn, statsFor } from '@/lib/usage/stats'

/**
 * A workflow's "Uses", read at request time: render it inside `<Suspense>`
 * (with `UsesStatFallback`), so the rest of the page stays prerendered.
 * Nothing when the store did not answer.
 */
export async function WorkflowUses({ workflowKey }: { workflowKey: string }) {
  const stats = await loadCopyStats()
  if (!stats) {
    return null
  }
  const { total, week } = statsFor(stats, workflowKey)
  return (
    <UsesStat
      hotPlace={placeOn(stats, workflowKey, 'hot')}
      total={total}
      week={week}
    />
  )
}
