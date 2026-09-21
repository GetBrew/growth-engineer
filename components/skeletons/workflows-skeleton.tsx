import { HeadingSkeleton, ToolbarSkeleton, WorkflowRowsSkeleton } from './parts'

/**
 * `/workflows` and `/hacks` — below the hero: the heading, the All · Top ·
 * New · Hacks pills with the search, then the workflow rows.
 */
export function WorkflowsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <HeadingSkeleton />
      <ToolbarSkeleton />
      <WorkflowRowsSkeleton />
    </div>
  )
}
