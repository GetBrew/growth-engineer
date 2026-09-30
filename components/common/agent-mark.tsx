import { BubbleChatSpark01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils/cn'

export function AgentMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground',
        className
      )}
    >
      <HugeiconsIcon icon={BubbleChatSpark01Icon} size={14} strokeWidth={1.8} />
    </span>
  )
}
