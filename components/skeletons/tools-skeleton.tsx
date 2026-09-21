import { CategoryRowsSkeleton, ToolbarSkeleton } from './parts'

/** `/tools` — under the heading: the filters and search, then categories. */
export function ToolsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      <ToolbarSkeleton pills={5} searchClassName="lg:w-80" />
      <CategoryRowsSkeleton sections={[4, 1, 2]} />
    </div>
  )
}
