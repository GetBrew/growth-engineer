import { CatalogListSkeleton, HeadingSkeleton, ToolbarSkeleton } from './parts'

export function WorkflowsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-(--space-lg)">
      <HeadingSkeleton titleWidth="w-72" />
      <div className="flex flex-col gap-(--space-3xl)">
        <ToolbarSkeleton />
        <CatalogListSkeleton count={6} />
      </div>
    </div>
  )
}
