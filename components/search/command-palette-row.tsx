'use client'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { EntityIcon } from '@/components/common/entity-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Section } from '@/lib/constants/sections'
import type { PaletteItem } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

/** One navigable row: a result, a "see all" link, or a section to jump to. */
export type Option = {
  id: string
  href: string
  title: string
  subtitle?: string
  image?: PaletteItem['image']
  entity: Section['entity']
  isMore?: boolean
}

/**
 * A real link, so it prefetches and opens in a new tab like any other; the
 * input keeps focus and points at the highlighted row.
 *
 * ONE row is highlighted at a time: pointing at a row selects it, the way
 * the arrow keys do, instead of a hover tint beside the keyboard's. It is
 * mousemove, not mouseenter, so rows scrolling under a resting pointer while
 * the arrow keys move do not steal the selection.
 */
export function Row({
  id,
  isActive,
  onPoint,
  onSelect,
  option,
}: {
  id: string
  isActive: boolean
  onPoint: () => void
  onSelect: () => void
  option: Option
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  return (
    <Link
      aria-selected={isActive}
      className={cn(
        'focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left',
        isActive && 'bg-muted'
      )}
      href={option.href}
      id={id}
      onClick={onSelect}
      onMouseMove={isActive ? undefined : onPoint}
      ref={ref}
      role="option"
      tabIndex={-1}
    >
      {option.image ? (
        // The logo or photo the rest of the site shows for it: a logo
        // inset in a bordered circle, a photo filling it.
        <Avatar
          className={cn(
            'size-7 shrink-0 bg-background',
            !option.image.isPhoto && 'border border-border'
          )}
        >
          <AvatarImage
            alt=""
            className={
              option.image.isPhoto ? 'object-cover' : 'object-contain p-0.75'
            }
            src={option.image.url}
          />
          <AvatarFallback className="type-label bg-background text-soft">
            {option.title.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="grid size-7 shrink-0 place-items-center">
          <EntityIcon
            className="text-subtle"
            entity={option.entity}
            size={18}
          />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-control truncate">{option.title}</span>
        {option.subtitle ? (
          <span className="type-meta truncate">{option.subtitle}</span>
        ) : null}
      </span>
      {option.isMore ? (
        <HugeiconsIcon
          aria-hidden="true"
          className="shrink-0 text-subtle"
          icon={ArrowRight01Icon}
          size={16}
          strokeWidth={1.8}
        />
      ) : null}
    </Link>
  )
}
