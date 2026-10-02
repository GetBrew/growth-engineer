/**
 * The newsletter sign-up's rules, PURE so the form checks an address the way
 * the server will, and a test can pin them.
 */

export type SubscribeState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'already-subscribed' }
  | { status: 'error'; message: string }

/** RFC 5321's limit on a whole address. */
const MAX_EMAIL_LENGTH = 254

/** One @, something on each side, a dot in the domain, no spaces. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The address as typed, trimmed and in lower case — so `Ada@Gmail.com` and
 * `ada@gmail.com` are one contact, not two that each get the newsletter — or,
 * in the reader's words, why it is not one.
 */
export function parseEmail(
  raw: unknown
): { ok: true; email: string } | { ok: false; message: string } {
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (email === '') {
    return { ok: false, message: 'Enter your email address.' }
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_SHAPE.test(email)) {
    return { ok: false, message: 'Enter a valid email address.' }
  }
  return { ok: true, email }
}

/**
 * Brew's `POST /v1/contacts` body: an upsert of one subscribed contact, with
 * the consent it came with — this site's form, at this moment.
 */
export function contactRequest(email: string, capturedAt: Date) {
  return {
    email,
    subscribed: true,
    consent: {
      source: 'form' as const,
      capturedAt: capturedAt.toISOString(),
      evidence: 'Subscribed with the newsletter form on growth.engineer.',
    },
  }
}

/**
 * What Brew's answer means to the reader. Brew's error `code` decides; the
 * ones a reader can act on get their own words, and anything else is ours to
 * fix, so it asks them to try again rather than blame the address.
 */
export function resultFor(status: number, code?: string): SubscribeState {
  if (status === 200 || status === 201) {
    return { status: 'success' }
  }
  if (code === 'INVALID_EMAIL' || code === 'MISSING_EMAIL') {
    return { status: 'error', message: 'Enter a valid email address.' }
  }
  if (code === 'RESUBSCRIBE_NOT_ALLOWED') {
    return {
      status: 'error',
      message:
        'This address unsubscribed before, so we can’t add it again here.',
    }
  }
  if (status === 429) {
    return {
      status: 'error',
      message: 'Too many tries. Please try again later.',
    }
  }
  return { status: 'error', message: 'Something went wrong. Please try again.' }
}

/** One address's verdict from Brew's `POST /v1/contacts/validate`. */
export type Deliverability = {
  status: 'valid' | 'risky' | 'invalid'
  didYouMean?: string
  isDisposable?: boolean
}

/**
 * Whether an address may join the list, from Brew's deliverability check:
 * `null` lets it through. An undeliverable address would bounce and wear down
 * the sending domain's reputation, and a throwaway inbox is gone by the first
 * issue, so neither is added; any other `risky` one (a role address such as
 * `team@`, a catch-all domain) still reaches a person, so it is.
 */
export function deliverabilityProblem(
  check: Deliverability
): SubscribeState | null {
  if (check.status === 'invalid') {
    return {
      status: 'error',
      message: check.didYouMean
        ? `This address can’t receive email. Did you mean ${check.didYouMean}?`
        : 'This address can’t receive email. Check it for typos.',
    }
  }
  if (check.isDisposable) {
    return {
      status: 'error',
      message: 'Please use a permanent email address.',
    }
  }
  return null
}

/** What Brew's `GET /v1/contacts/{email}` says about a known address. */
export type ExistingContact = { subscribed: boolean; suppressed?: boolean }

/**
 * What an address already in Brew means for the sign-up: `null` carries on to
 * the check and the save. A subscriber is told so, with no check spent on
 * them; an address Brew suppressed (it bounced, or reported spam) is never
 * added back. One that is known but not subscribed carries on, and Brew still
 * refuses anyone who opted out.
 */
export function existingContactResult(
  contact: ExistingContact
): SubscribeState | null {
  if (contact.suppressed) {
    return {
      status: 'error',
      message: 'This address can’t receive email. Check it for typos.',
    }
  }
  if (contact.subscribed) {
    return { status: 'already-subscribed' }
  }
  return null
}
