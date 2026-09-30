'use client'

import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { EntityIcon, type EntityKind } from '@/components/common/entity-icon'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SECTIONS } from '@/lib/constants/sections'
import { useIsClient } from '@/lib/hooks/use-is-client'
import { cn } from '@/lib/utils/cn'

const LINK =
  'focus-ring type-control inline-flex h-8 items-center rounded-full px-3 text-soft transition-colors hover:bg-hover hover:text-foreground'

const NAV_SECTIONS = SECTIONS.filter((section) => section.entity !== 'workflow')

const ROW_ITEM =
  'focus-ring type-control flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-soft transition-colors hover:bg-hover hover:text-foreground'

function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Links({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Sections" className="ml-6 hidden items-center sm:flex">
      {NAV_SECTIONS.map((section) => {
        const current = isCurrent(pathname, section.href)
        return (
          <Link
            aria-current={current ? 'page' : undefined}
            className={cn(LINK, current && 'bg-hover text-foreground')}
            href={section.href}
            key={section.href}
          >
            {section.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Menu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'pill' }),
          'h-9 gap-1 px-3 text-soft sm:hidden'
        )}
        render={<button type="button" />}
      >
        Browse
        <HugeiconsIcon
          aria-hidden="true"
          className={cn(
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
          icon={ArrowDown01Icon}
          size={16}
          strokeWidth={1.8}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="floating-panel w-56 gap-0 p-2 ring-0"
        sideOffset={8}
      >
        <PopoverTitle className="type-meta px-2.5 pt-1 pb-2">
          Browse
        </PopoverTitle>
        <ul>
          {NAV_SECTIONS.map((section) => {
            const current = isCurrent(pathname, section.href)
            return (
              <li key={section.href}>
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    ROW_ITEM,
                    current && 'bg-hover text-foreground'
                  )}
                  href={section.href}
                  onClick={() => setOpen(false)}
                >
                  <EntityIcon entity={section.entity as EntityKind} size={16} />
                  {section.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function LinksAtPath() {
  return <Links pathname={usePathname()} />
}

function MenuAtPath() {
  return <Menu pathname={usePathname()} />
}

export function SectionLinks() {
  return useIsClient() ? <LinksAtPath /> : <Links pathname={null} />
}

export function BrowseMenu() {
  return useIsClient() ? <MenuAtPath /> : <Menu pathname={null} />
}
