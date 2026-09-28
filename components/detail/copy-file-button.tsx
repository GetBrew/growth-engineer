'use client'

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRecordCopy } from '@/components/detail/copy-count'
import { buttonVariants } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

/**
 * THE product action: copy the file, exactly as served, to paste into any
 * agent. The file carries its own setup, inputs and rules, so nothing is
 * added to it. On a page that counts copies (a workflow's), each one counts.
 */
export function CopyFileButton({
  markdown,
  label,
  className,
}: {
  markdown: string
  /** "Copy workflow", "Copy tool". */
  label: string
  className?: string
}) {
  const { copied, copy } = useCopy()
  const recordCopy = useRecordCopy()
  const text = copied ? 'Copied' : label
  return (
    // On phones the primary action takes the rest of the row.
    <button
      className={cn(
        buttonVariants({ size: 'pill' }),
        'max-sm:flex-1',
        className
      )}
      onClick={async () => {
        if (await copy(markdown)) {
          recordCopy?.()
        }
      }}
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
