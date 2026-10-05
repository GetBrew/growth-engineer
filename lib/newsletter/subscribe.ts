'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { newsletterEnv } from '@/lib/env'
import { allowSignUp } from '@/lib/newsletter/rate-limit'
import {
  contactRequest,
  type Deliverability,
  deliverabilityProblem,
  type ExistingContact,
  existingContactResult,
  parseEmail,
  resultFor,
  type SubscribeState,
} from '@/lib/newsletter/subscribe-email'

const BREW_API = 'https://brew.new/api/v1'

/** Past this, Brew is treated as down for this sign-up rather than hold it. */
const TIMEOUT_MS = 8000

/** A Brew request: its own headers are added to the key's. */
type BrewInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * The footer's newsletter sign-up: a server action, so the Brew key — read
 * from the deployment's environment — never reaches the browser, and the
 * open-source code holds no secret. An address already subscribed is told
 * so, and one Brew suppressed is not added back; otherwise Brew checks the
 * mailbox exists (2 credits) and only an address that passes is added, as a
 * subscribed contact with the form's consent — so a newsletter never bounces
 * off one. A new subscriber then fires the welcome trigger, after the reply.
 * If the check cannot run, nothing is added and the reader is asked to try
 * again: the list's deliverability is worth more than one sign-up.
 * `website` is a honeypot hidden from people: a bot that fills it is told it
 * worked and nothing is sent.
 */
export async function subscribe(formData: FormData): Promise<SubscribeState> {
  if (formData.get('website')) {
    return { status: 'success' }
  }
  const parsed = parseEmail(formData.get('email'))
  if (!parsed.ok) {
    return { status: 'error', message: parsed.message }
  }
  const env = newsletterEnv()
  if (!env) {
    return { status: 'error', message: 'Sign-up is not available right now.' }
  }
  if (!(await allowSignUp(await headers()))) {
    return resultFor(429)
  }

  const brewHeaders = {
    Authorization: `Bearer ${env.apiKey}`,
    'Content-Type': 'application/json',
    ...(env.brandId ? { 'X-Brand-Id': env.brandId } : {}),
  }

  const call = (path: string, init: BrewInit = {}) =>
    fetch(`${BREW_API}${path}`, {
      ...init,
      headers: { ...brewHeaders, ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

  try {
    const known = await call(`/contacts/${encodeURIComponent(parsed.email)}`)
    if (known.ok) {
      const existing = existingContactResult(
        (await known.json()) as ExistingContact
      )
      if (existing) {
        return existing
      }
    } else {
      // Only "no such contact" means a new address; a 404 for the brand
      // (a wrong BREW_BRAND_ID) is a failure like any other.
      const code = await errorCode(known)
      if (code !== 'CONTACT_NOT_FOUND') {
        return failed('look-up', known.status, code)
      }
    }

    const checked = await call('/contacts/validate', {
      method: 'POST',
      body: JSON.stringify({ emails: [parsed.email] }),
    })
    if (!checked.ok) {
      return failed('check', checked.status, await errorCode(checked))
    }
    const { data } = (await checked.json()) as { data: Array<Deliverability> }
    const problem = data[0] ? deliverabilityProblem(data[0]) : resultFor(503)
    if (problem) {
      return problem
    }

    const saved = await call('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactRequest(parsed.email, new Date())),
    })
    if (!saved.ok) {
      return failed('save', saved.status, await errorCode(saved))
    }
    const { welcomeTriggerId } = env
    if (welcomeTriggerId) {
      after(() => sendWelcome(call, welcomeTriggerId, parsed.email))
    }
    return resultFor(saved.status)
  } catch (error) {
    console.error('[newsletter] Brew did not answer:', String(error))
    return resultFor(503)
  }
}

/**
 * Fire the welcome trigger, so its Brew automation sends the welcome email.
 * Runs after the reader has their thanks: a welcome that fails is logged,
 * never a failed sign-up. The `Idempotency-Key` comes from the address, so
 * a retry or a double submit sends one welcome, not two.
 */
async function sendWelcome(
  call: (path: string, init?: BrewInit) => Promise<Response>,
  triggerId: string,
  email: string
): Promise<void> {
  try {
    const fired = await call(
      `/automations/triggers/${encodeURIComponent(triggerId)}/fire`,
      {
        method: 'POST',
        headers: {
          'Idempotency-Key': `welcome-${createHash('sha256').update(email).digest('hex')}`,
        },
        body: JSON.stringify({ payload: { email } }),
      }
    )
    if (!fired.ok) {
      console.error(
        `[newsletter] Brew welcome failed: ${fired.status} ${await errorCode(fired)}`
      )
    }
  } catch (error) {
    console.error('[newsletter] Brew welcome did not answer:', String(error))
  }
}

/** Brew's stable error `code`, from its `{ error: { code } }` envelope. */
async function errorCode(response: Response): Promise<string | undefined> {
  const body = (await response.json().catch(() => null)) as {
    error?: { code?: string }
  } | null
  return body?.error?.code
}

/**
 * A step Brew refused: logged on the server with Brew's own code — never the
 * key or the address — so a failed sign-up can be explained, then put in the
 * reader's words.
 */
function failed(
  step: 'look-up' | 'check' | 'save',
  status: number,
  code: string | undefined
): SubscribeState {
  console.error(`[newsletter] Brew ${step} failed: ${status} ${code}`)
  return resultFor(status, code)
}
