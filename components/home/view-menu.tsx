'use client'

import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils/cn'

const ITEM =
  'focus-ring type-control flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-soft transition-colors hover:bg-hover hover:text-foreground'

/**
 * Which way a tab's list is ordered — New, Hot, Popular — as a dropdown
 * beside the search box. The same Popover as the navbar's Browse menu, so it
 * adds nothing to the bundle.
 */
export function ViewMenu({
  views,
  value,
  onChange,
}: {
  views: ReadonlyArray<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = views.find((view) => view.value === value) ?? views[0]

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'outline', size: 'pill' }),
          'shrink-0 gap-1 pr-3 text-soft hover:text-foreground'
        )}
        render={<button type="button" />}
      >
        <span className="sr-only">Order: </span>
        {current?.label}
        <HugeiconsIcon
          aria-hidden="true"
          className={cn(
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
          icon={ArrowDown01Icon}
          size={15}
          strokeWidth={1.8}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="floating-panel w-44 gap-0 p-2 ring-0"
        sideOffset={8}
      >
        <PopoverTitle className="type-meta px-2.5 pt-1 pb-2">
          Order by
        </PopoverTitle>
        <ul>
          {views.map((view) => {
            const isCurrent = view.value === current?.value
            return (
              <li key={view.value}>
                <button
                  aria-pressed={isCurrent}
                  className={cn(ITEM, isCurrent && 'text-foreground')}
                  onClick={() => {
                    onChange(view.value)
                    setOpen(false)
                  }}
                  type="button"
                >
                  {view.label}
                  {isCurrent ? (
                    <HugeiconsIcon
                      aria-hidden="true"
                      icon={Tick02Icon}
                      size={15}
                      strokeWidth={1.8}
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
