'use client'

import { Share08Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { DETAIL_ACTION, DETAIL_ACTION_ICON } from '@/components/detail/chrome'

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
    <button className={DETAIL_ACTION} onClick={share} type="button">
      <HugeiconsIcon
        aria-hidden="true"
        icon={copied ? Tick02Icon : Share08Icon}
        size={DETAIL_ACTION_ICON}
        strokeWidth={1.8}
      />
      {copied ? 'Copied' : 'Share'}
    </button>
  )
}
