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

export function statsFor(stats: CopyStatsByKey, key: string): CopyStats {
  return stats[key] ?? NO_COPIES
}

/**
 * Items ranked by copies ever made (Popular), most first. Ties keep the order
 * they came in (newest), so a catalog nobody has copied yet reads as it did.
 */
export function rankByCopies<Item>(
  items: ReadonlyArray<Item>,
  keyOf: (item: Item) => string,
  stats: CopyStatsByKey
): Array<Item> {
  return items
    .map((item, index) => ({
      item,
      index,
      value: statsFor(stats, keyOf(item)).total,
    }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(({ item }) => item)
}

/**
 * Where a workflow places by copies: 1 for the most copied. `null` when it
 * has none, so a page never claims "#16" for nothing.
 */
export function placeOn(stats: CopyStatsByKey, key: string): number | null {
  const value = statsFor(stats, key).total
  if (value === 0) {
    return null
  }
  return 1 + Object.values(stats).filter((other) => other.total > value).length
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
