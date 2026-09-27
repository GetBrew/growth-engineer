/**
 * "Did you mean …": the closest candidates to what an agent typed, by edit
 * distance, so a typo gets a ref to try instead of a dead end.
 */

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0] ?? 0
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j] ?? 0
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      diagonal = above
    }
  }
  return row[b.length] ?? 0
}

/** The best matches within two edits, as a trailing sentence (or ""). */
export function closest(
  input: string,
  candidates: ReadonlyArray<string>,
  limit = 3
): string {
  const needle = input.toLowerCase()
  // A ref is compared whole and by its key, so `clya` finds `company:clay`.
  const score = (candidate: string) => {
    const lower = candidate.toLowerCase()
    const key = lower.slice(lower.indexOf(':') + 1)
    return Math.min(distance(needle, lower), distance(needle, key))
  }
  const near = candidates
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .filter((item) => item.score <= 2)
    .sort((a, b) => a.score - b.score || a.candidate.localeCompare(b.candidate))
    .slice(0, limit)
    .map((item) => item.candidate)
  return near.length > 0 ? ` Did you mean ${near.join(', ')}?` : ''
}
