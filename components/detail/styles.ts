import { Book02Icon, Globe02Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const DETAIL_ACTION = cn(
  buttonVariants({ variant: 'ghost', size: 'pill' }),
  'px-3 text-soft hover:text-foreground'
)

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

export const SIDE_HEADING = 'type-control text-foreground'

export const BRIEF_LIST = 'flex flex-col gap-4'
export const BRIEF_ITEM = 'grid grid-cols-(--grid-brief) gap-x-3'

export const BRIEF_MARKER =
  'type-helper grid h-5 place-items-center text-soft tabular-nums'
export const BRIEF_PRIMARY = 'type-helper text-foreground'
export const BRIEF_SECONDARY = 'type-helper text-soft'
