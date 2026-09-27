import { describe, expect, test } from 'vitest'
import {
  completeChips,
  MAX_CHIPS,
  parseSearchText,
  searchHref,
  searchStateFromParams,
  searchText,
} from '@/lib/catalog/query'

const TAGS = [
  'capability:enrich-contacts',
  'capability:find-work-emails',
  'motion:outbound',
  'channel:smb',
  'channel:enterprise',
  'has:mcp',
  'has:cli',
]

describe('search grammar', () => {
  test('splits words from chips, keeps unknown namespaces as words', () => {
    expect(
      parseSearchText('enrich linkedin channel:smb has:mcp price:cheap')
    ).toEqual({
      words: ['enrich', 'linkedin', 'price:cheap'],
      chips: ['channel:smb', 'has:mcp'],
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
    expect(
      completeChips(['channel:sm', 'has:mcp', 'channel:xyz'], TAGS)
    ).toEqual({
      chips: ['channel:smb', 'has:mcp'],
      unknown: ['channel:xyz'],
    })
  })

  test('only a unique prefix completes', () => {
    // `capability:` + nothing, or a prefix two tags share, is not a choice.
    expect(completeChips(['has:c', 'capability:'], TAGS)).toEqual({
      chips: ['has:cli'],
      unknown: ['capability:'],
    })
    expect(
      completeChips(['channel:'], [...TAGS, 'channel:smb-saas']).unknown
    ).toEqual(['channel:'])
    expect(
      completeChips(['channel:smb'], [...TAGS, 'channel:smb-saas']).chips
    ).toEqual(['channel:smb'])
    expect(
      completeChips(['channel:sm'], [...TAGS, 'channel:smb-saas'])
    ).toEqual({
      chips: [],
      unknown: ['channel:sm'],
    })
  })

  test('the URL is the query, in one canonical order', () => {
    const state = searchStateFromParams({
      has: 'mcp,cli',
      q: 'cold outbound',
      channel: 'smb',
    })
    expect(state).toEqual({
      words: ['cold', 'outbound'],
      chips: ['channel:smb', 'has:mcp', 'has:cli'],
    })
    expect(searchHref('/tools', state)).toBe(
      '/tools?q=cold+outbound&channel=smb&has=mcp,cli'
    )
    expect(searchHref('/tools', { words: [], chips: [] })).toBe('/tools')
  })

  test('the same search from text and from params has the same words and chips', () => {
    const fromText = parseSearchText(
      'cold outbound has:cli channel:smb has:mcp'
    )
    const fromParams = searchStateFromParams({
      q: 'cold outbound',
      channel: 'smb',
      has: 'mcp,cli',
    })
    expect(fromText.words.join(' ')).toBe(fromParams.words.join(' '))
    expect([...fromText.chips].sort()).toEqual([...fromParams.chips].sort())
  })

  test('the search box shows words then chips', () => {
    expect(searchText(parseSearchText('enrich has:mcp'))).toBe('enrich has:mcp')
  })

  test('rejects hostile slugs from the URL', () => {
    expect(
      searchStateFromParams({ capability: 'ok,<script>,../x' }).chips
    ).toEqual(['capability:ok'])
  })
})
