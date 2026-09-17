import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** Eyebrow + title + one line, the head of every catalog section. */
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
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <p className="text-foreground/55 text-sm">{eyebrow}</p>
        ) : null}
        <Heading
          className={cn('font-semibold tracking-[-0.03em]', {
            'text-3xl sm:text-4xl': Heading === 'h1',
            'text-2xl': Heading === 'h2',
          })}
        >
          {title}
        </Heading>
        {description ? (
          <p className="max-w-xl text-foreground/62 text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/** A pill that IS a link, so filters are URLs and need no JavaScript. */
export function PillLink({
  href,
  active = false,
  children,
}: {
  href: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors',
        {
          'border-foreground bg-foreground text-background': active,
          'border-border bg-white text-foreground/62 hover:border-foreground/20 hover:text-foreground':
            !active,
        }
      )}
      href={href}
    >
      {children}
    </Link>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border border-dashed px-6 py-14 text-center">
      <p className="font-medium text-base text-foreground/70">{title}</p>
      {hint ? <p className="mt-1 text-foreground/55 text-sm">{hint}</p> : null}
    </div>
  )
}

/** The page column every catalog route shares. */
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
        'mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
