import { CatalogListSkeleton, HeadingSkeleton, ToolbarSkeleton } from './parts'

export function WorkflowsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <HeadingSkeleton />
      <ToolbarSkeleton />
      <CatalogListSkeleton count={6} />
    </div>
  )
}
