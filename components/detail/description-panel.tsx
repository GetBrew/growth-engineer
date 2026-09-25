'use client'

import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useId, useState } from 'react'
import type { EntityKind } from '@/components/common/entity-icon'
import { NoResults } from '@/components/common/no-results'
import { PANEL_HEADING } from '@/components/detail/styles'
import { useClampOverflow } from '@/lib/hooks/use-clamp-overflow'
import { cn } from '@/lib/utils/cn'

const PARAGRAPH = 'type-body'

const BLANK_LINE = /\n\s*\n/

export function DescriptionSection({
  text,
  entity,
}: {
  text?: string

  entity: EntityKind
}) {
  const [first, ...rest] = (text ?? '')
    .split(BLANK_LINE)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section className="flex flex-col gap-3">
      <h2 className={PANEL_HEADING}>Description</h2>
      {first ? (
        <DescriptionCard first={first} rest={rest} />
      ) : (
        <NoDescription entity={entity} />
      )}
    </section>
  )
}

function DescriptionCard({
  first,
  rest,
}: {
  first: string
  rest: ReadonlyArray<string>
}) {
  const [open, setOpen] = useState(false)
  const restId = useId()
  const clamps = rest.length === 0
  const [ref, overflows] = useClampOverflow<HTMLParagraphElement>(
    clamps && !open
  )

  return (
    <div>
      <p className={cn(PARAGRAPH, clamps && !open && 'line-clamp-5')} ref={ref}>
        {first}
      </p>
      {rest.length > 0 || overflows ? (
        <>
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-400 ease-out motion-reduce:transition-none',
              open && rest.length > 0 ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
            id={restId}
          >
            <div className="overflow-hidden">
              {rest.map((paragraph) => (
                <p className={cn(PARAGRAPH, 'mt-4')} key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <button
            aria-controls={rest.length > 0 ? restId : undefined}
            aria-expanded={open}
            className="focus-ring type-label mt-2 flex items-center gap-1.5 rounded-sm text-soft transition-colors duration-200 hover:text-foreground"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? 'Show less' : 'Read more'}
            <HugeiconsIcon
              aria-hidden="true"
              className={cn(
                'transition-transform duration-200',
                open && 'rotate-180'
              )}
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={1.8}
            />
          </button>
        </>
      ) : null}
    </div>
  )
}

function NoDescription({ entity }: { entity: EntityKind }) {
  return (
    <NoResults
      description="The summary above is all there is for now."
      entity={entity}
      title="No description yet"
    />
  )
}
