import { describe, expect, test } from 'vitest'
import { loadWorkflowSearchItems } from '@/lib/catalog/loaders'
import { searchWorkflowItems } from '@/lib/catalog/search'
import {
  type CopyStatsByKey,
  formatCount,
  placeOn,
  rankByCopies,
} from '@/lib/usage/stats'

/**
 * Popular — every copy ever made — is pure, so the listing sorts in the
 * browser exactly as tested here.
 */

const STATS: CopyStatsByKey = {
  a: { total: 10, week: 1, lastWeek: 0 },
  b: { total: 3, week: 7, lastWeek: 2 },
  c: { total: 10, week: 0, lastWeek: 9 },
}

describe('ranking by copies', () => {
  const keys = ['c', 'a', 'b', 'never-copied']
  const byKey = (key: string) => key

  test('Popular is all time, not this week', () => {
    expect(rankByCopies(keys, byKey, STATS)).toEqual([
      'c',
      'a',
      'b',
      'never-copied',
    ])
  })

  test('a tie keeps the order it came in', () => {
    expect(rankByCopies(['a', 'c'], byKey, STATS)).toEqual(['a', 'c'])
    expect(rankByCopies(['c', 'a'], byKey, STATS)).toEqual(['c', 'a'])
  })

  test('a place is claimed only with copies', () => {
    expect(placeOn(STATS, 'b')).toBe(3)
    expect(placeOn(STATS, 'never-copied')).toBeNull()
    // Equal counts share a place.
    expect(placeOn(STATS, 'a')).toBe(1)
    expect(placeOn(STATS, 'c')).toBe(1)
  })

  test('counts read short', () => {
    expect(formatCount(12)).toBe('12')
    expect(formatCount(1234)).toBe('1.2K')
    expect(formatCount(3_600_000)).toBe('3.6M')
  })
})

describe('the workflows listing', () => {
  const items = loadWorkflowSearchItems()
  const newest = searchWorkflowItems(items, { q: '', sort: 'new' })
  const [first, second, third] = newest.map((item) => item.workflow.key)
  const stats: CopyStatsByKey = {
    [third as string]: { total: 50, week: 2, lastWeek: 0 },
    [second as string]: { total: 5, week: 9, lastWeek: 0 },
  }
  const keysFor = (sort: 'new' | 'popular') =>
    searchWorkflowItems(items, { q: '', sort, stats }).map(
      (item) => item.workflow.key
    )

  test('orders Popular by the counts, ties newest first; New ignores them', () => {
    expect(keysFor('popular').slice(0, 3)).toEqual([third, second, first])
    expect(keysFor('new').slice(0, 3)).toEqual([first, second, third])
  })

  test('Popular with no counts is the New order', () => {
    expect(
      searchWorkflowItems(items, { q: '', sort: 'popular', stats: null })
    ).toEqual(newest)
  })
})
