import { describe, expect, test } from 'vitest'
import { loadWorkflowSearchItems } from '@/lib/catalog/loaders'
import { searchWorkflowItems } from '@/lib/catalog/search'
import {
  type CopyStatsByKey,
  formatCount,
  placeOn,
  rankByAngle,
} from '@/lib/usage/stats'

/**
 * The angles the copy counts open — Hot (this week) and Popular (all time) —
 * are pure, so the listing sorts in the browser exactly as tested here.
 */

const STATS: CopyStatsByKey = {
  a: { total: 10, week: 1, lastWeek: 0 },
  b: { total: 3, week: 7, lastWeek: 2 },
  c: { total: 10, week: 0, lastWeek: 9 },
}

describe('ranking by an angle', () => {
  const keys = ['c', 'a', 'b', 'never-copied']
  const byKey = (key: string) => key

  test('Hot is this week, Popular is all time', () => {
    expect(rankByAngle(keys, byKey, STATS, 'hot')).toEqual([
      'b',
      'a',
      'c',
      'never-copied',
    ])
    expect(rankByAngle(keys, byKey, STATS, 'popular')).toEqual([
      'c',
      'a',
      'b',
      'never-copied',
    ])
  })

  test('a tie keeps the order it came in', () => {
    expect(rankByAngle(['a', 'c'], byKey, STATS, 'popular')).toEqual(['a', 'c'])
    expect(rankByAngle(['c', 'a'], byKey, STATS, 'popular')).toEqual(['c', 'a'])
  })

  test('a place is claimed only with copies on the angle', () => {
    expect(placeOn(STATS, 'b', 'hot')).toBe(1)
    expect(placeOn(STATS, 'a', 'hot')).toBe(2)
    expect(placeOn(STATS, 'c', 'hot')).toBeNull()
    expect(placeOn(STATS, 'never-copied', 'popular')).toBeNull()
    // Equal counts share a place.
    expect(placeOn(STATS, 'a', 'popular')).toBe(1)
    expect(placeOn(STATS, 'c', 'popular')).toBe(1)
  })

  test('counts read short', () => {
    expect(formatCount(12)).toBe('12')
    expect(formatCount(1234)).toBe('1.2K')
    expect(formatCount(3_600_000)).toBe('3.6M')
  })
})

describe('the workflows listing', () => {
  const items = loadWorkflowSearchItems()
  const featured = searchWorkflowItems(items, { q: '', sort: 'featured' })
  const [first, second, third] = featured.map((item) => item.workflow.key)
  const stats: CopyStatsByKey = {
    [third as string]: { total: 50, week: 2, lastWeek: 0 },
    [second as string]: { total: 5, week: 9, lastWeek: 0 },
  }
  const keysFor = (sort: 'hot' | 'popular' | 'featured', q = '') =>
    searchWorkflowItems(items, { q, sort, stats }).map(
      (item) => item.workflow.key
    )

  test('orders Hot and Popular by the counts, the rest as featured', () => {
    expect(keysFor('hot').slice(0, 3)).toEqual([second, third, first])
    expect(keysFor('popular').slice(0, 3)).toEqual([third, second, first])
    expect(keysFor('featured')[0]).toBe(first)
  })

  test('an angle with no counts is the featured order', () => {
    expect(
      searchWorkflowItems(items, { q: '', sort: 'hot', stats: null })
    ).toEqual(featured)
  })
})
