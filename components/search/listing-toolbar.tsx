import type { ReactNode } from 'react'
import { FilterPills } from '@/components/search/filter-pills'
import type { FilterOption } from '@/components/search/filter-types'
import { cn } from '@/lib/utils/cn'

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
  isStacked = false,
}: {
  groups: ReadonlyArray<FilterGroup>
  search: ReactNode
  /** How the list is ordered (`OrderMenu`), just left of the search box. */
  order?: ReactNode
  /**
   * The filters take a full row of their own, with the controls and the
   * search box on the row below, so a row of pills never wraps around them.
   */
  isStacked?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        !isStacked && 'lg:flex-row lg:items-center lg:justify-between'
      )}
    >
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
      {isStacked ? (
        // The controls on the left and the search box on the right from lg;
        // on a phone the search box takes a row of its own when the controls
        // leave it less than its basis, so it keeps room to type.
        <div className="flex flex-wrap items-center gap-2">
          {order}
          <div className="min-w-0 flex-1 basis-48 lg:ml-auto lg:w-80 lg:flex-none lg:basis-auto">
            {search}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 lg:shrink-0">
          {order}
          <div className="min-w-0 flex-1 lg:w-80 lg:flex-none">{search}</div>
        </div>
      )}
    </div>
  )
}
