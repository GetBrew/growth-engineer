import { ConvexError } from 'convex/values'
import { describe, expect, test } from 'vitest'
import { getAppError, getAppErrorMessage } from '@/lib/errors/app-error'

describe('getAppErrorMessage', () => {
  test('shows a typed Convex error verbatim', () => {
    const error = new ConvexError({
      code: 'INVALID_INPUT',
      message: 'A task needs a title.',
    })
    expect(getAppErrorMessage(error, 'fallback')).toBe('A task needs a title.')
  })

  test('falls back for an untyped error', () => {
    // The whole point: an unexpected failure's message may carry internals, so
    // it never reaches a user.
    expect(
      getAppErrorMessage(new Error('ECONNREFUSED 10.0.0.4:5432'), 'Try again.')
    ).toBe('Try again.')
  })

  test('falls back for a ConvexError with an unrecognized payload', () => {
    const error = new ConvexError({ whatever: true })
    expect(getAppError(error)).toBeNull()
    expect(getAppErrorMessage(error, 'Try again.')).toBe('Try again.')
  })

  test('falls back for a thrown non-error', () => {
    expect(getAppErrorMessage('boom', 'Try again.')).toBe('Try again.')
  })
})
