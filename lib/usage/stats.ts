/**
 * What the copy counts say, PURE and browser-safe: the listings sort with it
 * in the browser, the server ranks the home page with it, and the tests run
 * it as is. The counts themselves are read by lib/usage/copies.ts.
 */

/** A workflow's copies: all time, the last 7 days, and the 7 days before. */
export type CopyStats = { total: number; week: number; lastWeek: number }

/** Every counted workflow's stats, by workflow key; a missing key is 0s. */
export type CopyStatsByKey = Readonly<Record<string, CopyStats>>

const NO_COPIES: CopyStats = { total: 0, week: 0, lastWeek: 0 }

/**
 * The angles the counts open. HOT is velocity: copies over the last 7 days.
 * POPULAR is every copy ever made.
 */
export type CopyAngle = 'hot' | 'popular'

export const COPY_ANGLES: Readonly<
  Record<CopyAngle, { label: string; title: string }>
> = {
  hot: { label: 'Hot', title: 'Hot this week' },
  popular: { label: 'Popular', title: 'Most popular' },
}

export function statsFor(stats: CopyStatsByKey, key: string): CopyStats {
  return stats[key] ?? NO_COPIES
}

/** The number an angle ranks by. */
export function angleValue(stats: CopyStats, angle: CopyAngle): number {
  return angle === 'hot' ? stats.week : stats.total
}

/**
 * Items ranked by an angle, most first. Ties keep the order they came in
 * (featured, or newest), so a catalog nobody has copied yet reads as it did.
 */
export function rankByAngle<Item>(
  items: ReadonlyArray<Item>,
  keyOf: (item: Item) => string,
  stats: CopyStatsByKey,
  angle: CopyAngle
): Array<Item> {
  return items
    .map((item, index) => ({
      item,
      index,
      value: angleValue(statsFor(stats, keyOf(item)), angle),
    }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(({ item }) => item)
}

/**
 * Where a workflow places on an angle: 1 for the most copied. `null` when it
 * has no copies there, so a page never claims "#16" for nothing.
 */
export function placeOn(
  stats: CopyStatsByKey,
  key: string,
  angle: CopyAngle
): number | null {
  const value = angleValue(statsFor(stats, key), angle)
  if (value === 0) {
    return null
  }
  return (
    1 +
    Object.values(stats).filter((other) => angleValue(other, angle) > value)
      .length
  )
}

const COMPACT = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const EXACT = new Intl.NumberFormat('en-US')

/** `1234` → "1.2K"; `12` → "12". */
export function formatCount(count: number): string {
  return COMPACT.format(count)
}

/** `1234` → "1,234". */
export function formatExact(count: number): string {
  return EXACT.format(count)
}
