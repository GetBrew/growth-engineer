'use client'

import {
  ArrowDown01Icon,
  Search01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useId, useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils/cn'
import type { FilterOption } from './filter-types'
import { pillClass } from './pill-link'

function labelFor(chosen: ReadonlyArray<FilterOption>): string {
  const [first] = chosen
  if (chosen.length === 1 && first) {
    return first.label
  }
  return chosen.length > 1 ? `More · ${chosen.length}` : 'More'
}

export function MoreFilters({
  options,
  title,
}: {
  options: ReadonlyArray<FilterOption>
  title: string
}) {
  const searchId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const chosen = options.filter((option) => option.active)
  const needle = query.trim().toLowerCase()
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(needle)
  )
  const triggerLabel = labelFor(chosen)

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery('')
        }
      }}
      open={open}
    >
      <PopoverTrigger
        className={pillClass(chosen.length > 0 || open)}
        render={<button type="button" />}
      >
        {triggerLabel}
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
        align="start"
        className="floating-panel w-80 gap-0 p-2.5 ring-0"
        sideOffset={8}
      >
        <PopoverTitle className="type-meta px-2 pt-1 pb-2">
          {title}
        </PopoverTitle>
        <label className="sr-only" htmlFor={searchId}>
          Search {title.toLowerCase()}
        </label>
        <InputGroup>
          <InputGroupAddon className="pl-3">
            <HugeiconsIcon
              aria-hidden="true"
              className="text-subtle"
              icon={Search01Icon}
              size={16}
              strokeWidth={1.8}
            />
          </InputGroupAddon>
          <InputGroupInput
            autoComplete="off"
            className="text-foreground"
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search…"
            type="search"
            value={query}
          />
        </InputGroup>
        <ul className="mt-2 max-h-64 overflow-y-auto overscroll-contain">
          {visible.map((option) => (
            <li key={option.key}>
              <Link
                aria-current={option.active ? 'true' : undefined}
                className={cn(
                  'focus-ring type-control flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200',
                  option.active
                    ? 'bg-muted text-foreground'
                    : 'text-subtle hover:bg-hover hover:text-foreground'
                )}
                href={option.href}
                onClick={() => setOpen(false)}
                scroll={false}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.count === undefined ? null : (
                  <span className="type-meta tabular-nums">{option.count}</span>
                )}
                <span
                  aria-hidden="true"
                  className="grid size-4 place-items-center"
                >
                  {option.active ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={14}
                      strokeWidth={2}
                    />
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? (
          <p className="type-body px-3 py-8 text-center">Nothing found</p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
