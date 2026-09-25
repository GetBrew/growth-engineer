import Link from 'next/link'
import { MaskIcon } from '@/components/layout/mask-icon'
import { cn } from '@/lib/utils/cn'

export function BrandLockup({
  className,
  markOnlyOnNarrow = false,
}: {
  className?: string
  markOnlyOnNarrow?: boolean
}) {
  return (
    <Link
      aria-label="growth.engineer home"
      className={cn(
        'focus-ring type-item flex w-fit items-center gap-2 rounded-sm',
        className
      )}
      href="/"
    >
      <MaskIcon className="-translate-y-px" size={18} src="/logo.svg" />
      <span className={cn(markOnlyOnNarrow && 'hidden min-[375px]:inline')}>
        growth.engineer
      </span>
    </Link>
  )
}
