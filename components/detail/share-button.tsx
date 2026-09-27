'use client'

import { Share08Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DETAIL_ACTION_ICON,
  DETAIL_ACTION_ICON_ONLY,
} from '@/components/detail/styles'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCopy } from '@/lib/hooks/use-copy'

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const { copied, copy } = useCopy()
  const label = copied ? 'Link copied' : 'Share'

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, text, url }).catch(() => undefined)
      return
    }
    await copy(url)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-label={label}
              className={DETAIL_ACTION_ICON_ONLY}
              onClick={share}
              type="button"
            />
          }
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={copied ? Tick02Icon : Share08Icon}
            size={DETAIL_ACTION_ICON}
            strokeWidth={1.8}
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
