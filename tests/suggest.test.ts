import { describe, expect, test } from 'vitest'
import { closest } from '@/lib/mcp/suggest'

/** "Did you mean": within two edits, and cheap on input that can't be a typo. */

describe('closest', () => {
  const refs = ['company:clay', 'company:apollo', 'tool:apollo/enrich-person']

  test('finds a ref two edits away, by the whole ref or its key', () => {
    expect(closest('clya', refs)).toBe(' Did you mean company:clay?')
    expect(closest('tool:apollo/enrich-persno', refs)).toBe(
      ' Did you mean tool:apollo/enrich-person?'
    )
  })

  test('says nothing past two edits, or for input no ref could be', () => {
    expect(closest('stripe', refs)).toBe('')
    expect(closest('x'.repeat(81), refs)).toBe('')
  })
})
