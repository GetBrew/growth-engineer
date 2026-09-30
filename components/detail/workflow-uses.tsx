import { UsesStat } from '@/components/detail/copy-count'
import { loadCopyStats } from '@/lib/usage/copies'
import { statsFor } from '@/lib/usage/stats'

export async function WorkflowUses({ workflowKey }: { workflowKey: string }) {
  const stats = await loadCopyStats()
  if (!stats) {
    return null
  }
  const { total, week } = statsFor(stats, workflowKey)
  return <UsesStat total={total} week={week} />
}
