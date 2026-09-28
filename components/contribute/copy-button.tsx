'use client'

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { buttonVariants } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

/**
 * Copies a sample to the clipboard, showing a tick for a moment after. The
 * same gesture the rendered file gets on a detail page
 * (`components/detail/markdown-file.tsx`), at the size a caption bar allows.
 */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const { copied, copy } = useCopy()

  return (
    <button
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
        'shrink-0 text-faint hover:text-foreground'
      )}
      onClick={() => copy(text)}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={copied ? Tick02Icon : Copy01Icon}
        size={14}
        strokeWidth={1.8}
      />
    </button>
  )
}
