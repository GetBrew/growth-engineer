import type { FilterOption } from './filter-types'
import { MoreFilters } from './more-filters'
import { PillLink } from './pill-link'

export function FilterPills({
  options,
  all,
  top = 3,
  moreTitle = 'More',
}: {
  options: ReadonlyArray<FilterOption>
  all?: { href: string; active: boolean }
  top?: number
  moreTitle?: string
}) {
  // Uncounted options (a sort order like "New") keep their place up front;
  // counted ones (tags) rank by count, so the pills shown are the busiest and
  // the rest go under More, alphabetically.
  const fixed = options.filter((option) => option.count === undefined)
  const counted = options
    .filter((option) => option.count !== undefined)
    .sort(
      (a, b) =>
        (b.count ?? 0) - (a.count ?? 0) || a.label.localeCompare(b.label)
    )
  const ranked = [...fixed, ...counted]
  const shown = ranked.slice(0, Math.max(top, fixed.length))
  const rest = ranked
    .slice(shown.length)
    .sort((a, b) => a.label.localeCompare(b.label))

  // Phones get one sideways-scrolling row that runs to the screen's edges
  // (the -mx/px pair cancels the page gutter) instead of pills wrapping into
  // ragged lines; py keeps the focus ring inside the scroll box.
  return (
    <div className="scrollbar-none flex flex-wrap gap-2 max-sm:-mx-4 max-sm:-my-1 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-4 max-sm:py-1">
      {all ? (
        <PillLink active={all.active} href={all.href}>
          All
        </PillLink>
      ) : null}
      {shown.map((option) => (
        <PillLink
          active={option.active}
          disabled={option.disabled}
          href={option.href}
          key={option.key}
        >
          {option.label}
          {option.count === undefined ? null : (
            <span className="type-meta">{option.count}</span>
          )}
        </PillLink>
      ))}
      {rest.length > 0 ? (
        <MoreFilters options={rest} title={moreTitle} />
      ) : null}
    </div>
  )
}
