import { Book02Icon, Globe02Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const DETAIL_ACTION = cn(
  buttonVariants({ variant: 'ghost', size: 'pill' }),
  'px-3 text-soft hover:text-foreground'
)

export const DETAIL_ACTION_ICON_ONLY = cn(
  buttonVariants({ variant: 'ghost', size: 'icon-pill' }),
  'text-soft hover:text-foreground'
)

/**
 * A labelled action that is a bare icon on phones, the size of Share. Pair it
 * with a label wrapped in `max-sm:sr-only`, so it keeps its name.
 */
export const HEADER_ACTION_COLLAPSING = cn(
  DETAIL_ACTION,
  'max-sm:w-10 max-sm:px-0'
)

export const LINK_ICON = {
  website: Globe02Icon,
  docs: Book02Icon,
} as const

export const DETAIL_ACTION_ICON = 16

export const PANEL_HEADING = 'type-category flex min-h-10 items-center'

/** A side column's quiet label: "Uses", "Tags", "How it runs". */
export const SIDE_HEADING = 'eyebrow uppercase'

/*
 * A workflow brief's lists (Outcome, How it works, the questions, Get
 * started) share one rhythm: a 20px marker column and a 12px gutter, so every
 * list's text starts on the same line; 16px between items; a 16/24 primary
 * line and a 14/21 secondary one.
 */
export const BRIEF_LIST = 'flex flex-col gap-4'
export const BRIEF_ITEM = 'grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3'
/** A ✓, a number or a dot, centred on the item's first line. */
export const BRIEF_MARKER =
  'type-body grid h-6 place-items-center text-soft tabular-nums'
export const BRIEF_PRIMARY = 'type-body text-foreground'
export const BRIEF_SECONDARY = 'type-helper text-soft'
