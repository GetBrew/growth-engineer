import type { ReactNode } from 'react'
import { FilterPills } from '@/components/filters/filter-pills'
import type { FilterOption } from '@/components/filters/types'

/**
 * One row of filter pills: a sort order, a tag namespace (motion, channel,
 * capability), a category. `allLabel` names the pill that clears the group.
 */
export type FilterGroup = {
  key: string
  /** For screen readers: "Sort workflows", "Filter by motion". */
  label: string
  /** Shown before the pills ("Sort", "Motion"); leave off for filters that
   * speak for themselves, like a category row. */
  title?: string
  all?: { href: string; active: boolean }
  options: ReadonlyArray<FilterOption>
  /** How many pills show before the rest move into the "More" popover. */
  top?: number
  moreTitle?: string
}

/**
 * A listing's controls, the same on /workflows, /tools and /companies:
 * filter rows on the left, the search on the right.
 *
 * Every row is a `FilterGroup`, so a listing adds one (motion, channel,
 * capability, format) by passing more data — the layout never changes.
 */
export function ListingToolbar({
  groups,
  search,
}: {
  groups: ReadonlyArray<FilterGroup>
  search: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {groups.map((group) => (
          <nav
            aria-label={group.label}
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
            key={group.key}
          >
            {group.title ? (
              <span className="type-meta text-faint">{group.title}</span>
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
      <div className="lg:w-72 lg:shrink-0">{search}</div>
    </div>
  )
}
