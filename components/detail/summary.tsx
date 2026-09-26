'use client'

import { useState } from 'react'
import { useClampOverflow } from '@/lib/hooks/use-clamp-overflow'
import { cn } from '@/lib/utils/cn'

export function DetailDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [ref, overflows] = useClampOverflow<HTMLParagraphElement>(!expanded)

  return (
    <div className="mt-2 max-w-2xl">
      <p className={cn('type-lead', expanded || 'line-clamp-2')} ref={ref}>
        {text}
      </p>
      {overflows ? (
        <button
          aria-expanded={expanded}
          className="focus-ring type-label mt-1.5 rounded-sm text-soft underline-offset-4 transition-colors hover:text-foreground hover:underline"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </div>
  )
}
