import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

/** The footer's signature. Who made it is credited in the bottom bar. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link
      aria-label="growth.engineer home"
      className={cn('focus-ring type-item w-fit rounded-sm', className)}
      href="/"
    >
      growth.engineer
    </Link>
  )
}
