import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * Every quiet action on a detail page — Share, Copy, Download. One constant,
 * so a new one cannot arrive at a different size or weight.
 *
 * px-3, not the pill's px-4: these sit in rows of two or three, and the extra
 * padding reads as a gap between unrelated buttons.
 */
export const DETAIL_ACTION = cn(
  buttonVariants({ variant: 'ghost', size: 'pill' }),
  'px-3 text-soft hover:text-foreground'
)

/** The icon size those buttons draw at. */
export const DETAIL_ACTION_ICON = 16

/**
 * Every panel heading. `min-h-10` is the height of an action button, so a
 * heading that shares its row with one starts on the same line as a heading
 * that does not — which is what keeps the two columns level.
 */
export const PANEL_HEADING = 'type-category flex min-h-10 items-center'

/**
 * An access route — MCP, CLI, API — wherever one is named: the header's
 * "Available as", and each step in "How it runs".
 */
export const ACCESS_CHIP =
  'type-label flex h-6 shrink-0 items-center rounded-full border bg-hover px-2.5 text-subtle'

/**
 * A small fact beside a record — "Founded 2021", "3 tools", "Deprecated". The
 * same shell as ACCESS_CHIP; `bg-hover` is what marks one as emphasised.
 */
export const META_CHIP =
  'type-meta flex h-6 shrink-0 items-center rounded-full border px-2.5'
