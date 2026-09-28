'use client'

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { buttonVariants } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

/**
 * THE product action: copy the file, exactly as served, to paste into any
 * agent. The file carries its own setup, inputs and rules, so nothing is
 * added to it.
 */
export function CopyFileButton({
  markdown,
  label,
}: {
  markdown: string
  /** "Copy workflow", "Copy tool". */
  label: string
}) {
  const { copied, copy } = useCopy()
  const text = copied ? 'Copied' : label
  return (
    // On phones the primary action takes the rest of the row.
    <button
      className={cn(buttonVariants({ size: 'pill' }), 'max-sm:flex-1')}
      onClick={() => copy(markdown)}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4"
        icon={copied ? Tick02Icon : Copy01Icon}
      />
      <span aria-live="polite">{text}</span>
    </button>
  )
}
