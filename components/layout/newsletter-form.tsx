'use client'

import { FavouriteIcon, MailLove01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useActionState, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribe } from '@/lib/newsletter/subscribe'
import {
  parseEmail,
  type SubscribeState,
} from '@/lib/newsletter/subscribe-email'
import styles from './newsletter-form.module.css'

/**
 * The footer's newsletter sign-up: an email box and Subscribe. The address is
 * checked here first, so a typo is answered at once; the server action
 * (lib/newsletter/subscribe.ts) checks it again and adds it to Brew. `website` is a honeypot hidden from people: a bot that fills it is
 * told it worked and nothing is sent.
 */
export function NewsletterForm() {
  const inputId = useId()
  const messageId = useId()
  // Kept here, not left to the form: React clears a form after it submits,
  // and a typo should be fixed, not typed again.
  const [email, setEmail] = useState('')
  const [state, submit, isPending] = useActionState(
    async (_previous: SubscribeState, formData: FormData) => {
      if (formData.get('website')) {
        return { status: 'success' } satisfies SubscribeState
      }
      const parsed = parseEmail(formData.get('email'))
      if (!parsed.ok) {
        return {
          status: 'error',
          message: parsed.message,
        } satisfies SubscribeState
      }
      return await subscribe(formData)
    },
    { status: 'idle' }
  )

  if (state.status === 'success' || state.status === 'already-subscribed') {
    return <Subscribed isAlready={state.status === 'already-subscribed'} />
  }

  const isInvalid = state.status === 'error'
  return (
    <form
      action={submit}
      className="flex w-full max-w-sm flex-col gap-2"
      noValidate
    >
      <label className="sr-only" htmlFor={inputId}>
        Email address
      </label>
      <div className="flex items-center gap-2">
        <Input
          aria-describedby={isInvalid ? messageId : undefined}
          aria-invalid={isInvalid || undefined}
          autoComplete="email"
          className="min-w-0 flex-1"
          disabled={isPending}
          id={inputId}
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@domain.com"
          type="email"
          value={email}
        />
        <Button disabled={isPending} size="pill" type="submit">
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {/* Hidden from people and assistive tech; only a bot fills it. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] size-px opacity-0"
        name="website"
        tabIndex={-1}
        type="text"
      />
      <p
        aria-live="polite"
        className="type-label min-h-4 text-destructive"
        id={messageId}
      >
        {isInvalid ? state.message : null}
      </p>
    </form>
  )
}

/**
 * The thank-you: a letter with a heart, and where the workflows will turn up, with a
 * heart that beats after the thanks. Plays once, then holds.
 */
function Subscribed({ isAlready }: { isAlready: boolean }) {
  return (
    <div aria-live="polite" className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`${styles.mark} grid size-10 shrink-0 place-items-center rounded-xl border bg-surface text-foreground`}
      >
        <HugeiconsIcon icon={MailLove01Icon} size={18} />
      </span>
      <p className={`${styles.words} flex flex-col`}>
        <span className="type-control text-foreground">
          {isAlready ? 'You’re already subscribed' : 'Thanks for subscribing'}{' '}
          <HugeiconsIcon
            aria-hidden="true"
            className={`${styles.heart} inline-block translate-y-[0.1em] fill-current text-heart`}
            icon={FavouriteIcon}
            size={14}
          />
        </span>
        <span className="type-helper text-soft">
          We’ll email you when new workflows go live.
        </span>
      </p>
    </div>
  )
}
