'use client'

import { Share08Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * Share this page: the system share sheet where there is one (phones), else
 * copy the URL and say so for a moment.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, text, url }).catch(() => undefined)
      return
    }
    await navigator.clipboard.writeText(url).catch(() => undefined)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline', size: 'pill' }),
        'text-soft hover:text-foreground'
      )}
      onClick={share}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={copied ? Tick02Icon : Share08Icon}
        size={16}
        strokeWidth={1.8}
      />
      {copied ? 'Copied' : 'Share'}
    </button>
  )
}
