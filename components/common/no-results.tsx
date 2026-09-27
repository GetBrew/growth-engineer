import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { EntityIcon, type EntityKind } from '@/components/common/entity-icon'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function NoResults({
  title,
  description,
  clearHref,
  entity,
  icon,
  children,
}: {
  title: string
  description?: string

  clearHref?: string

  entity?: EntityKind

  icon?: IconSvgElement

  children?: ReactNode
}) {
  return (
    <Empty className="rounded-none py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {entity ? (
            <EntityIcon entity={entity} size={20} />
          ) : (
            <HugeiconsIcon
              aria-hidden="true"
              icon={icon ?? Search01Icon}
              strokeWidth={1.8}
            />
          )}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {clearHref ? (
        <Link
          className={buttonVariants({ variant: 'outline', size: 'pill' })}
          href={clearHref}
        >
          Clear filters
        </Link>
      ) : null}
      {children}
    </Empty>
  )
}
