import { Book02Icon, Globe02Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export const DETAIL_ACTION = cn(
  buttonVariants({ variant: 'ghost', size: 'pill' }),
  'px-3 text-soft hover:text-foreground'
)

export const DETAIL_ACTION_ICON_ONLY = cn(
  buttonVariants({ variant: 'ghost', size: 'icon-pill' }),
  'text-soft hover:text-foreground'
)

export const LINK_ICON = {
  website: Globe02Icon,
  docs: Book02Icon,
} as const

export const DETAIL_ACTION_ICON = 16

export const PANEL_HEADING = 'type-category flex min-h-10 items-center'

export const ACCESS_CHIP =
  'type-label flex h-6 shrink-0 items-center rounded-full border bg-hover px-2.5 text-subtle'

export const META_CHIP =
  'type-meta flex h-6 shrink-0 items-center rounded-full border px-2.5'
