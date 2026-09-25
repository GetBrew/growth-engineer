import { CategoryRowsSkeleton, HeadingSkeleton, ToolbarSkeleton } from './parts'

export function ToolsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-(--space-lg)">
      <HeadingSkeleton titleWidth="w-56" />
      <div className="flex flex-col gap-(--space-3xl)">
        <ToolbarSkeleton pills={5} searchClassName="lg:w-80" />
        <CategoryRowsSkeleton sections={[4, 1, 2]} />
      </div>
    </div>
  )
}
