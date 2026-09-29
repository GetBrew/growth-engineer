'use client'

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRecordCopy } from '@/components/detail/copy-count'
import { DropIntoAgent } from '@/components/detail/drop-into-agent'
import { buttonVariants } from '@/components/ui/button'
import { toastManager } from '@/components/ui/toast-manager'
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
  noun,
  className,
}: {
  markdown: string
  /** "Copy workflow", "Copy tool". */
  label: string
  /** What is copied, for the toast that follows: "Workflow", "Tool". */
  noun: string
  className?: string
}) {
  const { copied, copy } = useCopy()
  const recordCopy = useRecordCopy()
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
          toastManager.add({
            title: `${noun} copied`,
            description: 'Paste it into Claude, ChatGPT or Cursor to run it.',
            media: <DropIntoAgent />,
          })
          recordCopy?.()
        }
      }}
      type="button"
    >
      {/* A plain swap to a check: the toast that opens carries the
          animation, so the button does not play one of its own. */}
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4"
        icon={copied ? Tick02Icon : Copy01Icon}
      />
      {/* Both labels share one cell, so the button keeps the wider one's
          width and nothing beside it moves when "Copied!" swaps in. */}
      <span className="grid justify-items-start text-left">
        <span className={cn('col-start-1 row-start-1', copied && 'invisible')}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn('col-start-1 row-start-1', !copied && 'invisible')}
        >
          Copied!
        </span>
      </span>
    </button>
  )
}
