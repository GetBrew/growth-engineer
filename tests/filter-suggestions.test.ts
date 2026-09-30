import { describe, expect, test } from 'vitest'
import {
  type FilterOption,
  suggestFilters,
} from '@/lib/catalog/filter-suggestions'

const OPTIONS: Array<FilterOption> = [
  { key: 'motion:outbound', kind: 'motion', label: 'Outbound', count: 7 },
  { key: 'motion:inbound', kind: 'motion', label: 'Inbound', count: 4 },
  { key: 'motion:plg', kind: 'motion', label: 'Product-led', count: 2 },
  { key: 'channel:email', kind: 'channel', label: 'Email', count: 9 },
  { key: 'category:email', kind: 'category', label: 'Email', count: 3 },
  { key: 'has:mcp', kind: 'has', label: 'Has MCP', count: 5 },
  { key: 'company:apollo', kind: 'company', label: 'Apollo', count: 3 },
  { key: 'channel:chat', kind: 'channel', label: 'Chat', count: 0 },
]

const keys = (text: string, active: Array<string> = []) =>
  suggestFilters(OPTIONS, text, { active }).map((entry) => entry.option.key)

describe('suggestFilters', () => {
  test('a word that names a filter suggests it, the channel before the category', () => {
    expect(keys('email')).toEqual(['channel:email', 'category:email'])
    const [first] = suggestFilters(OPTIONS, 'funding email', { active: [] })
    expect(first).toEqual({
      option: OPTIONS[3],
      rest: 'funding',
      isExact: true,
    })
  })

  test('a prefix suggests, but is not exact', () => {
    const [first] = suggestFilters(OPTIONS, 'outb', { active: [] })
    expect(first?.option.key).toBe('motion:outbound')
    expect(first?.isExact).toBe(false)
  })

  test('a slug, a later word of the label, and a phrase all match', () => {
    expect(keys('plg')).toEqual(['motion:plg'])
    expect(keys('mcp')).toEqual(['has:mcp'])
    const [phrase] = suggestFilters(OPTIONS, 'find product led', {
      active: [],
    })
    expect(phrase).toMatchObject({ rest: 'find', isExact: true })
  })

  test('nothing typed offers every motion and channel, busiest first', () => {
    expect(keys('')).toEqual([
      'motion:outbound',
      'motion:inbound',
      'motion:plg',
      'channel:email',
    ])
    expect(suggestFilters(OPTIONS, '', { active: [], limit: 1 })).toHaveLength(
      4
    )
  })

  test('no suggestion for a finished word, one letter, an unknown word, an active filter or an empty one', () => {
    expect(keys('email ')).toEqual([])
    expect(keys('e')).toEqual([])
    expect(keys('funding')).toEqual([])
    expect(keys('email', ['channel:email'])).toEqual(['category:email'])
    expect(keys('chat')).toEqual([])
  })
})
