import { type DetailTag, DetailTagPill } from '@/components/detail/header'
import { PANEL_HEADING } from '@/components/detail/styles'

/**
 * A detail page's tags as a card in its side column, beside "How it runs":
 * each pill links to the listing it filters.
 */
export function TagBox({ tags }: { tags: ReadonlyArray<DetailTag> }) {
  if (tags.length === 0) {
    return null
  }
  return (
    <section className="flex flex-col gap-(--space-xs)">
      <h2 className={PANEL_HEADING}>Tags</h2>
      <div className="flex flex-wrap gap-1.5 rounded-2xl border bg-background p-5">
        {tags.map((tag) => (
          <DetailTagPill key={tag.label} tag={tag} />
        ))}
      </div>
    </section>
  )
}
