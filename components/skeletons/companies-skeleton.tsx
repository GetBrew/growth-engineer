import { CategoryRowsSkeleton, ToolbarSkeleton } from './parts'

export function CompaniesSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      <ToolbarSkeleton />
      <CategoryRowsSkeleton sections={[2, 1, 1, 2]} />
    </div>
  )
}
