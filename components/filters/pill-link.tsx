import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export function pillClass(active: boolean, disabled = false): string {
  return cn(
    'focus-ring type-control flex h-10 items-center gap-2 rounded-full border px-4 transition-colors',
    disabled && 'cursor-not-allowed bg-background text-faint/60',
    !disabled &&
      (active
        ? 'border-foreground/20 bg-muted text-foreground'
        : 'border-border bg-background text-subtle hover:border-foreground/20 hover:bg-hover hover:text-foreground')
  )
}

export function PillLink({
  href,
  active = false,
  disabled = false,
  children,
}: {
  href: string
  active?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" className={pillClass(false, true)}>
        {children}
      </span>
    )
  }
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={pillClass(active)}
      href={href}
      scroll={false}
    >
      {children}
    </Link>
  )
}
