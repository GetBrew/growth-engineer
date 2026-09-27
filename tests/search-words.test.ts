import { describe, expect, test } from 'vitest'
import {
  matchWords,
  queryWords,
  stem,
  tokens,
} from '@/lib/catalog/search-words'

/**
 * How every search surface reads a query: the same words, the same stems,
 * the same kinds — on the listings, in ⌘K and over MCP.
 */

describe('search words', () => {
  test('tokens: letters and digits in any script, accents folded', () => {
    expect(tokens('Zoë’s CRM — v2!')).toEqual(['zoe', 's', 'crm', 'v2'])
  })

  test.each([
    ['enriching', 'enrich'],
    ['companies', 'compan'],
    ['funded', 'fund'],
    ['leads', 'lead'],
    ['crms', 'crm'],
    ['planning', 'plan'],
    ['calling', 'call'],
    ['emails', 'email'],
    ['crm', 'crm'],
    ['is', 'is'],
  ])('stem(%s) is %s, always a prefix of the word', (word, expected) => {
    expect(stem(word)).toBe(expected)
    expect(word.startsWith(stem(word))).toBe(true)
  })

  test('function words drop; a query of nothing else keeps them', () => {
    expect(queryWords('find a way to enrich the leads').words).toEqual([
      'find',
      'way',
      'enrich',
      'lead',
    ])
    expect(queryWords('the').words).toEqual(['the'])
  })

  test('one kind word picks the type; two pick none; neither is matched', () => {
    expect(queryWords('outbound workflows')).toEqual({
      words: ['outbound'],
      kind: 'workflow',
      isNothing: false,
    })
    expect(queryWords('tools and workflows').kind).toBeUndefined()
    expect(queryWords('vendors').words).toEqual([])
  })

  test('punctuation alone matches nothing, not everything', () => {
    expect(queryWords('???').isNothing).toBe(true)
    expect(queryWords('').isNothing).toBe(false)
  })

  test('a title hit counts double; a miss counts nothing', () => {
    expect(
      matchWords(['enrich', 'crm'], 'Enrich contacts', 'data enrichment')
    ).toEqual({ matched: 1, weight: 2 })
    expect(matchWords(['data'], 'Enrich contacts', 'data enrichment')).toEqual({
      matched: 1,
      weight: 1,
    })
  })
})
