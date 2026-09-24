import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { NoResults } from '@/components/catalog/no-results'
import { cn } from '@/lib/utils/cn'

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Heading = 'h2',
}: {
  eyebrow?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col">
        {eyebrow ? <p className="type-body mb-1">{eyebrow}</p> : null}
        <Heading className="type-page-title">{title}</Heading>
        {description ? (
          <p className="type-body mt-2 max-w-xl">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return <NoResults description={hint} title={title} variant="card" />
}

export function Page({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'page-container pt-10 pb-(--space-section) sm:pt-14',
        className
      )}
    >
      {children}
    </div>
  )
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="focus-ring type-control flex w-fit items-center gap-2 rounded-sm text-subtle transition-colors duration-200 hover:text-foreground"
      href={href}
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={ArrowLeft01Icon}
        size={16}
        strokeWidth={1.8}
      />
      {label}
    </Link>
  )
}
