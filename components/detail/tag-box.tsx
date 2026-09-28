import { type DetailTag, DetailTagPill } from '@/components/detail/header'
import { SIDE_HEADING } from '@/components/detail/styles'

/**
 * A detail page's tags in its side column, as bare pills: each links to the
 * listing it filters.
 */
export function TagBox({ tags }: { tags: ReadonlyArray<DetailTag> }) {
  if (tags.length === 0) {
    return null
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className={SIDE_HEADING}>Tags</h2>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <DetailTagPill key={tag.label} tag={tag} />
        ))}
      </div>
    </section>
  )
}
