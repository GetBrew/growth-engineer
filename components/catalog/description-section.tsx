'use client'

import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { MaskIcon } from '@/components/site/mask-icon'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { EXPO_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils/cn'

const CARD = 'rounded-2xl border bg-surface p-5 sm:p-6'
const PARAGRAPH = 'type-body'
/** Paragraphs are split on a blank line. */
const BLANK_LINE = /\n\s*\n/

/**
 * A detail page's long description. The first paragraph shows; the rest
 * opens under "Read more". No description is an empty state, not a gap.
 */
export function DescriptionSection({
  text,
  icon,
}: {
  text?: string
  /** The entity's mark for the empty state: `/tool.svg`, `/workflow.svg`. */
  icon: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const restId = useId()
  const [first, ...rest] = (text ?? '')
    .split(BLANK_LINE)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section className="flex flex-col gap-5">
      <h2 className="type-section">Description</h2>
      {first ? (
        <div className={CARD}>
          <p className={PARAGRAPH}>{first}</p>
          {rest.length > 0 ? (
            <>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                    exit={{ height: 0, opacity: 0 }}
                    id={restId}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                      ease: EXPO_OUT,
                    }}
                  >
                    {rest.map((paragraph) => (
                      <p className={cn(PARAGRAPH, 'mt-4')} key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <button
                aria-controls={restId}
                aria-expanded={open}
                className="type-control mt-4 flex items-center gap-1.5 text-subtle transition-colors hover:text-foreground"
                onClick={() => setOpen((value) => !value)}
                type="button"
              >
                {open ? 'Show less' : 'Read more'}
                <HugeiconsIcon
                  aria-hidden="true"
                  className={cn('transition-transform', open && 'rotate-180')}
                  icon={ArrowDown01Icon}
                  size={14}
                  strokeWidth={1.8}
                />
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <Empty className={cn(CARD, 'border-solid p-8 sm:p-8')}>
          <EmptyHeader>
            <EmptyMedia
              className="bg-background ring-1 ring-border"
              variant="icon"
            >
              <MaskIcon size={20} src={icon} />
            </EmptyMedia>
            <EmptyTitle>No description yet</EmptyTitle>
            <EmptyDescription>
              The summary above is all there is for now.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )
}
