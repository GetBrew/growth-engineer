'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type Status = 'idle' | 'copied' | 'failed'

const LABEL: Record<Exclude<Status, 'idle'>, string> = {
  copied: 'Copied',
  failed: 'Copy failed',
}

const ANNOUNCE: Record<Status, string> = {
  idle: '',
  copied: 'Prompt copied to clipboard',
  failed: 'Copy failed. Select the text and copy it manually.',
}

/**
 * THE product action. Copies the file exactly as served — the same bytes the
 * `.md` URL returns — and says so for screen readers.
 */
export function CopyPromptButton({
  markdown,
  className,
  label = 'Copy prompt',
}: {
  markdown: string
  className?: string
  label?: string
}) {
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    },
    []
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <button
      className={cn(
        'focus-ring flex h-10 min-w-[8.5rem] items-center justify-center gap-2 rounded-full px-4 font-medium text-sm transition-colors',
        {
          'bg-foreground text-background hover:bg-black/80':
            status !== 'copied',
          'bg-tool text-white': status === 'copied',
        },
        className
      )}
      onClick={copy}
      type="button"
    >
      {status === 'copied' ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      {status === 'idle' ? label : LABEL[status]}
      <span aria-live="polite" className="sr-only">
        {ANNOUNCE[status]}
      </span>
    </button>
  )
}
