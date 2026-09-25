import { CategoryRowsSkeleton, HeadingSkeleton, ToolbarSkeleton } from './parts'

export function CompaniesSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-(--space-lg)">
      <HeadingSkeleton titleWidth="w-72" />
      <div className="flex flex-col gap-(--space-3xl)">
        <ToolbarSkeleton />
        <CategoryRowsSkeleton sections={[2, 1, 1, 2]} />
      </div>
    </div>
  )
}
