import { UsesStat } from '@/components/detail/copy-count'
import { loadCopyStats } from '@/lib/usage/copies'
import { statsFor } from '@/lib/usage/stats'

/**
 * How many times a workflow was copied, read at request time: render it
 * inside `<Suspense>` (with `UsesStatFallback`), so the rest of the page
 * stays prerendered. Nothing when the store did not answer.
 */
export async function WorkflowUses({ workflowKey }: { workflowKey: string }) {
  const stats = await loadCopyStats()
  if (!stats) {
    return null
  }
  return <UsesStat total={statsFor(stats, workflowKey).total} />
}
