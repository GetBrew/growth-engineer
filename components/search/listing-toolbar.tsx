import type { ReactNode } from 'react'
import { FilterPills } from '@/components/search/filter-pills'
import type { FilterOption } from '@/components/search/filter-types'

export type FilterGroup = {
  key: string

  label: string

  title?: string
  all?: { href: string; active: boolean }
  options: ReadonlyArray<FilterOption>

  top?: number
  moreTitle?: string
}

export function ListingToolbar({
  groups,
  search,
  order,
}: {
  groups: ReadonlyArray<FilterGroup>
  search: ReactNode
  /** How the list is ordered (`OrderMenu`), beside the search box. */
  order?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {groups.map((group) => (
          <nav
            aria-label={group.label}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 max-sm:flex-col max-sm:flex-nowrap max-sm:items-stretch"
            key={group.key}
          >
            {group.title ? (
              <span className="type-meta">{group.title}</span>
            ) : null}
            <FilterPills
              all={group.all}
              moreTitle={group.moreTitle}
              options={group.options}
              top={group.top}
            />
          </nav>
        ))}
      </div>
      <div className="flex items-center gap-2 lg:shrink-0">
        <div className="min-w-0 flex-1 lg:w-80 lg:flex-none">{search}</div>
        {order}
      </div>
    </div>
  )
}
