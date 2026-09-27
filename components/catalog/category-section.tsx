import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { EntityLogo } from '@/components/common/entity-logo'

/** How many rows a category shows before the rest fold into "See …". */
export const CATEGORY_PREVIEW = 6

/** One row of a category: the row itself, and what "See …" names it by. */
export type CategoryEntry = {
  key: string
  name: string
  logo: { name: string; logoUrl?: string }
  row: ReactNode
}

/** The same listing, opened out: every row of the category, no "See …". */
export function withExpandedView(href: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}view=all`
}

/**
 * One category of a listing: the heading and count, the first
 * `CATEGORY_PREVIEW` rows in two columns, then one "See …" link that names
 * what is folded away and opens the category in full. Every listing draws
 * its categories through this, so /tools and /companies read the same however
 * large the catalog grows.
 */
export function CategorySection({
  title,
  entries,
  moreHref,
  isExpanded = false,
}: {
  title: string
  entries: ReadonlyArray<CategoryEntry>
  /** Where "See …" goes; without it every row is shown. */
  moreHref?: string
  isExpanded?: boolean
}) {
  const folds = Boolean(moreHref) && !isExpanded
  const visible = folds ? entries.slice(0, CATEGORY_PREVIEW) : entries
  const hidden = folds ? entries.slice(CATEGORY_PREVIEW) : []

  return (
    <section className="flex flex-col gap-(--space-md)">
      <div className="flex items-baseline gap-3">
        <h2 className="type-category">{title}</h2>
        <span className="type-meta">{entries.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
        {visible.map((entry) => (
          <Fragment key={entry.key}>{entry.row}</Fragment>
        ))}
      </div>
      {moreHref && hidden.length > 0 ? (
        <Link
          className="focus-ring group/more flex items-center gap-4 rounded-xl py-3 text-subtle transition-colors hover:text-foreground"
          href={moreHref}
        >
          <span className="flex shrink-0 [&>*+*]:-ml-2">
            {hidden.slice(0, 3).map((entry) => (
              <EntityLogo
                className="rounded-lg ring-2 ring-background"
                key={entry.key}
                logoUrl={entry.logo.logoUrl}
                name={entry.logo.name}
                size={28}
              />
            ))}
          </span>
          <span className="type-control min-w-0 flex-1 truncate">
            {moreLabel(hidden.map((entry) => entry.name))}
          </span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform group-hover/more:translate-x-1"
            icon={ArrowRight02Icon}
          />
        </Link>
      ) : null}
    </section>
  )
}

/** "See Apollo", "See Apollo and Clay", "See Apollo, Clay, and more". */
function moreLabel(names: ReadonlyArray<string>): string {
  const [first, second] = names
  if (names.length === 1) {
    return `See ${first}`
  }
  if (names.length === 2) {
    return `See ${first} and ${second}`
  }
  return `See ${first}, ${second}, and more`
}
