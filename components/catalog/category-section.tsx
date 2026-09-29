import { Fragment, type ReactNode } from 'react'
import { type FoldedEntry, SeeMoreRow } from '@/components/catalog/see-more-row'

/**
 * How many rows a category shows before the rest fold away. Seven, so the
 * "more" row makes the eighth and the two-column grid ends on a full line.
 */
const LISTING_PREVIEW = 7

/** One row of a category: the row itself, and what "more" names it by. */
export type CategoryEntry = FoldedEntry & { row: ReactNode }

/** The same listing, opened out: every row, no "more" row. */
export function withExpandedView(href: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}view=all`
}

/**
 * One category of a listing: the heading and count, the first
 * `LISTING_PREVIEW` rows in two columns, then one row that names what is
 * folded away and opens the category in full. Every listing draws its
 * categories through this, so /tools and /companies read the same however
 * large the catalog grows.
 */
export function CategorySection({
  title,
  entries,
  noun,
  moreHref,
  isExpanded = false,
}: {
  title: string
  entries: ReadonlyArray<CategoryEntry>
  /** Plural, lowercase, for the "more" row: "tools", "companies". */
  noun: string
  /** Where the "more" row goes; without it every row is shown. */
  moreHref?: string
  isExpanded?: boolean
}) {
  // Eight fit whole, so a "1 more" row never replaces the last one.
  const folds =
    Boolean(moreHref) && !isExpanded && entries.length > LISTING_PREVIEW + 1
  const visible = folds ? entries.slice(0, LISTING_PREVIEW) : entries
  const hidden = folds ? entries.slice(LISTING_PREVIEW) : []

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
        {moreHref && hidden.length > 0 ? (
          <SeeMoreRow hidden={hidden} href={moreHref} noun={noun} />
        ) : null}
      </div>
    </section>
  )
}
