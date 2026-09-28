'use client'

import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
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

type Order = {
  value: string
  label: string
  /** A listing's order is a link — its URL is the state. */
  href?: string
}

/**
 * Which way a list is ordered — Featured, Hot, Popular, New — as a dropdown
 * beside its search box: links on a listing, whose URL is the state; buttons
 * on the home page's tabs (`onChange`). The same Popover as the navbar's
 * Browse menu, so it adds nothing to the bundle.
 */
export function OrderMenu({
  orders,
  value,
  onChange,
}: {
  orders: ReadonlyArray<Order>
  value: string
  onChange?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = orders.find((order) => order.value === value) ?? orders[0]
  const close = () => setOpen(false)

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
          {orders.map((order) => {
            const isCurrent = order.value === current?.value
            const className = cn(ITEM, isCurrent && 'text-foreground')
            const label = (
              <>
                {order.label}
                {isCurrent ? (
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={Tick02Icon}
                    size={15}
                    strokeWidth={1.8}
                  />
                ) : null}
              </>
            )
            return (
              <li key={order.value}>
                {order.href ? (
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    className={className}
                    href={order.href}
                    onClick={close}
                    scroll={false}
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    aria-pressed={isCurrent}
                    className={className}
                    onClick={() => {
                      onChange?.(order.value)
                      close()
                    }}
                    type="button"
                  >
                    {label}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
