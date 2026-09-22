import type { ReactNode } from 'react'
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
          <p className="type-body mt-1.5 max-w-xl">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
      <p className="type-item text-foreground/70">{title}</p>
      {hint ? (
        <p className="type-body mt-1 text-foreground/55">{hint}</p>
      ) : null}
    </div>
  )
}

export function Page({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('page-container pt-10 pb-24 sm:pt-14', className)}>
      {children}
    </div>
  )
}
