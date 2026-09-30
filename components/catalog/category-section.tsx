import { Fragment, type ReactNode } from 'react'
import { type FoldedEntry, SeeMoreRow } from '@/components/catalog/see-more-row'

const LISTING_PREVIEW = 7

export type CategoryEntry = FoldedEntry & { row: ReactNode }

export function withExpandedView(href: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}view=all`
}

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
