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
  'fit:smb',
  'fit:enterprise',
  'has:mcp',
  'has:cli',
]

describe('search grammar', () => {
  test('splits words from chips, keeps unknown namespaces as words', () => {
    expect(
      parseSearchText('enrich linkedin fit:smb has:mcp price:cheap')
    ).toEqual({
      words: ['enrich', 'linkedin', 'price:cheap'],
      chips: ['fit:smb', 'has:mcp'],
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
    expect(completeChips(['fit:sm', 'has:mcp', 'fit:xyz'], TAGS)).toEqual({
      chips: ['fit:smb', 'has:mcp'],
      unknown: ['fit:xyz'],
    })
  })

  test('only a unique prefix completes', () => {
    // `capability:` + nothing, or a prefix two tags share, is not a choice.
    expect(completeChips(['has:c', 'capability:'], TAGS)).toEqual({
      chips: ['has:cli'],
      unknown: ['capability:'],
    })
    expect(completeChips(['fit:'], [...TAGS, 'fit:smb-saas']).unknown).toEqual([
      'fit:',
    ])
    expect(completeChips(['fit:smb'], [...TAGS, 'fit:smb-saas']).chips).toEqual(
      ['fit:smb']
    )
    expect(completeChips(['fit:sm'], [...TAGS, 'fit:smb-saas'])).toEqual({
      chips: [],
      unknown: ['fit:sm'],
    })
  })

  test('the URL is the query, in one canonical order', () => {
    const state = searchStateFromParams({
      has: 'mcp,cli',
      q: 'cold outbound',
      fit: 'smb',
    })
    expect(state).toEqual({
      words: ['cold', 'outbound'],
      chips: ['fit:smb', 'has:mcp', 'has:cli'],
    })
    expect(searchHref('/tools', state)).toBe(
      '/tools?q=cold+outbound&fit=smb&has=mcp,cli'
    )
    expect(searchHref('/tools', { words: [], chips: [] })).toBe('/tools')
  })

  test('the same search from text and from params produces the same key', () => {
    const fromText = parseSearchText('cold outbound has:cli fit:smb has:mcp')
    const fromParams = searchStateFromParams({
      q: 'cold outbound',
      fit: 'smb',
      has: 'mcp,cli',
    })
    expect(searchKey(fromText)).toBe(searchKey(fromParams))
  })

  test('the search box shows words then chips, and toggling round-trips', () => {
    const state = parseSearchText('enrich has:mcp')
    expect(searchText(state)).toBe('enrich has:mcp')
    expect(toggleChip(state, 'has:mcp').chips).toEqual([])
    expect(toggleChip(state, 'fit:smb').chips).toEqual(['has:mcp', 'fit:smb'])
  })

  test('rejects hostile slugs from the URL', () => {
    expect(
      searchStateFromParams({ capability: 'ok,<script>,../x' }).chips
    ).toEqual(['capability:ok'])
  })
})
