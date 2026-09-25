/**
 * The guide's walkthrough, embedded from Loom. A guide without a recording
 * shows no box at all — the page never promises a video it does not have.
 *
 * It fills its column, and the page gives it a reading column rather than the
 * full width — a 16:9 box as wide as the viewport stands taller than
 * everything around it.
 */
export function GuideVideo({
  loomId,
  title,
}: {
  loomId: string
  title: string
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-surface">
      <iframe
        allow="fullscreen"
        allowFullScreen
        className="size-full"
        loading="lazy"
        src={`https://www.loom.com/embed/${encodeURIComponent(loomId)}`}
        title={title}
      />
    </div>
  )
}
