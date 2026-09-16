import { describe, expect, test } from 'vitest'
import {
  completeChips,
  MAX_CHIPS,
  parseSearchText,
  searchHref,
  searchKey,
  searchStateFromParams,
  searchText,
  toggleChip,
} from '@/lib/catalog/query'

const TAGS = [
  'capability:enrich-contacts',
  'capability:find-work-emails',
  'motion:outbound',
  'agent:native',
  'agent:friendly',
  'has:mcp',
  'has:cli',
]

describe('search grammar', () => {
  test('splits words from chips, keeps unknown namespaces as words', () => {
    expect(
      parseSearchText('enrich linkedin agent:native has:mcp price:cheap')
    ).toEqual({
      words: ['enrich', 'linkedin', 'price:cheap'],
      chips: ['agent:native', 'has:mcp'],
    })
  })

  test('chips are deduplicated and capped', () => {
    const text = Array.from(
      { length: MAX_CHIPS + 3 },
      (_, i) => `capability:c${i}`
    ).join(' ')
    expect(parseSearchText(`${text} has:mcp has:mcp`).chips).toHaveLength(
      MAX_CHIPS
    )
  })

  test('a partial chip completes itself; an impossible one is reported', () => {
    expect(completeChips(['agent:nat', 'has:mcp', 'agent:xyz'], TAGS)).toEqual({
      chips: ['agent:native', 'has:mcp'],
      unknown: ['agent:xyz'],
    })
  })

  test('the URL is the query, in one canonical order', () => {
    const state = searchStateFromParams({
      has: 'mcp,cli',
      q: 'cold outbound',
      agent: 'native',
    })
    expect(state).toEqual({
      words: ['cold', 'outbound'],
      chips: ['agent:native', 'has:mcp', 'has:cli'],
    })
    expect(searchHref('/tools', state)).toBe(
      '/tools?q=cold+outbound&agent=native&has=mcp,cli'
    )
    expect(searchHref('/tools', { words: [], chips: [] })).toBe('/tools')
  })

  test('the same search from text and from params produces the same key', () => {
    const fromText = parseSearchText(
      'cold outbound has:cli agent:native has:mcp'
    )
    const fromParams = searchStateFromParams({
      q: 'cold outbound',
      agent: 'native',
      has: 'mcp,cli',
    })
    expect(searchKey(fromText)).toBe(searchKey(fromParams))
  })

  test('the search box shows words then chips, and toggling round-trips', () => {
    const state = parseSearchText('enrich has:mcp')
    expect(searchText(state)).toBe('enrich has:mcp')
    expect(toggleChip(state, 'has:mcp').chips).toEqual([])
    expect(toggleChip(state, 'agent:native').chips).toEqual([
      'has:mcp',
      'agent:native',
    ])
  })

  test('rejects hostile slugs from the URL', () => {
    expect(
      searchStateFromParams({ capability: 'ok,<script>,../x' }).chips
    ).toEqual(['capability:ok'])
  })
})
