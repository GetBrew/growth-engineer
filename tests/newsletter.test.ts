import { describe, expect, test } from 'vitest'
import {
  contactRequest,
  deliverabilityProblem,
  existingContactResult,
  parseEmail,
  resultFor,
} from '@/lib/newsletter/subscribe-email'

describe('parseEmail', () => {
  test('accepts an address, trimmed and in lower case', () => {
    expect(parseEmail('  Ada@Example.COM ')).toEqual({
      ok: true,
      email: 'ada@example.com',
    })
    expect(parseEmail('first.last+news@sub.example.co.uk')).toMatchObject({
      ok: true,
    })
  })

  test('says what to fix when it is empty or not an address', () => {
    expect(parseEmail('')).toEqual({
      ok: false,
      message: 'Enter your email address.',
    })
    expect(parseEmail(null)).toMatchObject({ ok: false })
    for (const bad of [
      'ada',
      'ada@',
      '@example.com',
      'ada@example',
      'ada @example.com',
      'ada@@example.com',
      `${'a'.repeat(250)}@example.com`,
    ]) {
      expect(parseEmail(bad), bad).toEqual({
        ok: false,
        message: 'Enter a valid email address.',
      })
    }
  })
})

describe('contactRequest', () => {
  test('asks Brew for one subscribed contact, with the form as its consent', () => {
    expect(
      contactRequest('ada@example.com', new Date('2026-10-02T10:00:00Z'))
    ).toEqual({
      email: 'ada@example.com',
      subscribed: true,
      consent: {
        source: 'form',
        capturedAt: '2026-10-02T10:00:00.000Z',
        evidence: 'Subscribed with the newsletter form on growth.engineer.',
      },
    })
  })
})

describe('resultFor', () => {
  test('a created or updated contact is a sign-up', () => {
    expect(resultFor(201)).toEqual({ status: 'success' })
    expect(resultFor(200)).toEqual({ status: 'success' })
  })

  test("Brew's answers a reader can act on get their own words", () => {
    expect(resultFor(422, 'INVALID_EMAIL')).toEqual({
      status: 'error',
      message: 'Enter a valid email address.',
    })
    expect(resultFor(422, 'RESUBSCRIBE_NOT_ALLOWED')).toMatchObject({
      status: 'error',
      message: expect.stringContaining('unsubscribed before'),
    })
    expect(resultFor(429, 'RATE_LIMITED')).toMatchObject({
      message: 'Too many tries. Please try again later.',
    })
  })

  test('anything else is ours to fix, never blamed on the address', () => {
    for (const [status, code] of [
      [401, 'INVALID_API_KEY'],
      [403, 'BRAND_SCOPE_MISMATCH'],
      [500, undefined],
      [503, undefined],
    ] as const) {
      expect(resultFor(status, code), `${status} ${code}`).toEqual({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      })
    }
  })
})

describe('deliverabilityProblem', () => {
  test('a deliverable address joins, a role address too', () => {
    expect(deliverabilityProblem({ status: 'valid' })).toBeNull()
    expect(deliverabilityProblem({ status: 'risky' })).toBeNull()
  })

  test('an undeliverable address is refused, with a fix when Brew has one', () => {
    expect(
      deliverabilityProblem({ status: 'invalid', didYouMean: 'ada@gmail.com' })
    ).toEqual({
      status: 'error',
      message: 'This address can’t receive email. Did you mean ada@gmail.com?',
    })
    expect(deliverabilityProblem({ status: 'invalid' })).toEqual({
      status: 'error',
      message: 'This address can’t receive email. Check it for typos.',
    })
  })

  test('a throwaway inbox is refused even when it is deliverable', () => {
    expect(
      deliverabilityProblem({ status: 'risky', isDisposable: true })
    ).toEqual({
      status: 'error',
      message: 'Please use a permanent email address.',
    })
  })
})

describe('existingContactResult', () => {
  test('a subscriber is told so, and spends no check', () => {
    expect(existingContactResult({ subscribed: true })).toEqual({
      status: 'already-subscribed',
    })
  })

  test('a suppressed address is never added back, subscribed or not', () => {
    for (const subscribed of [true, false]) {
      expect(
        existingContactResult({ subscribed, suppressed: true })
      ).toMatchObject({ status: 'error' })
    }
  })

  test('a known address that is not subscribed carries on to the check', () => {
    expect(existingContactResult({ subscribed: false })).toBeNull()
  })
})
