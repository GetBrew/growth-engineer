import { PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

/**
 * The guide's walkthrough. A Loom share id turns this into the real embed; a
 * guide without one yet gets the placeholder, which holds exactly the same
 * 16:9 box — so dropping the recording in later moves nothing on the page.
 *
 * It fills its column, and the page gives it a reading column rather than the
 * full width — a 16:9 box as wide as the viewport stands taller than
 * everything around it.
 */
export function GuideVideo({
  loomId,
  title,
}: {
  loomId?: string
  title: string
}) {
  if (loomId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-surface">
        <iframe
          allow="fullscreen"
          allowFullScreen
          className="size-full"
          src={`https://www.loom.com/embed/${loomId}`}
          title={title}
        />
      </div>
    )
  }

  return (
    <div className="grid aspect-video w-full place-items-center rounded-2xl border border-dashed bg-surface">
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full border bg-background text-soft">
          <HugeiconsIcon
            aria-hidden="true"
            className="translate-x-px"
            icon={PlayIcon}
            size={20}
            strokeWidth={1.8}
          />
        </span>
        <p className="type-label text-faint">Walkthrough coming soon</p>
      </div>
    </div>
  )
}
