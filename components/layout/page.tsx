import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

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
