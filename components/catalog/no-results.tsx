import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

/** A listing with nothing to show, and the way back to everything. */
export function NoResults({
  title,
  description,
  clearHref,
  icon,
}: {
  title: string
  description: string
  /** The listing with every filter and search removed; no button without it. */
  clearHref?: string
  /** The listing's own mark; a search glass by default. */
  icon?: ReactNode
}) {
  return (
    <Empty className="rounded-none border-y border-solid py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon ?? (
            <HugeiconsIcon
              aria-hidden="true"
              icon={Search01Icon}
              strokeWidth={1.8}
            />
          )}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {clearHref ? (
        <Link
          className={buttonVariants({ variant: 'outline', size: 'pill' })}
          href={clearHref}
        >
          Clear filters
        </Link>
      ) : null}
    </Empty>
  )
}
