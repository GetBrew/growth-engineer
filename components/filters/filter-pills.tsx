import { MoreFilters } from './more-filters'
import { PillLink } from './pill-link'
import type { FilterOption } from './types'

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
  // With counts, the biggest come first; without (e.g. sort orders), the
  // order given is the order shown.
  const counted = options.every((option) => option.count !== undefined)
  const ranked = counted
    ? [...options].sort(
        (a, b) =>
          (b.count ?? 0) - (a.count ?? 0) || a.label.localeCompare(b.label)
      )
    : [...options]
  const shown = ranked.slice(0, top)
  const rest = counted
    ? ranked.slice(top).sort((a, b) => a.label.localeCompare(b.label))
    : ranked.slice(top)

  return (
    <div className="flex flex-wrap gap-2">
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
            <span className="type-label opacity-60">{option.count}</span>
          )}
        </PillLink>
      ))}
      {rest.length > 0 ? (
        <MoreFilters options={rest} title={moreTitle} />
      ) : null}
    </div>
  )
}
