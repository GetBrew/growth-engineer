import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const MOVE = 'transition-[translate,opacity] duration-300 ease-out'

/**
 * The navbar's primary pill: on hover the icon slides from the right edge to
 * the left and the label shifts over to make room. Held still for reduced
 * motion.
 */
export function SlideIconLink({
  href,
  icon,
  children,
  className,
}: {
  href: string
  icon: IconSvgElement
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      className={cn(
        buttonVariants({ size: 'pill' }),
        'group/cta relative gap-1',
        className
      )}
      href={href}
    >
      <HugeiconsIcon
        aria-hidden="true"
        className={cn(
          MOVE,
          'absolute left-4 size-4.25 -translate-x-4 opacity-0 motion-safe:group-hover/cta:translate-x-0 motion-safe:group-hover/cta:opacity-100'
        )}
        icon={icon}
        size={17}
        strokeWidth={1.8}
      />
      <span
        className={cn(MOVE, 'motion-safe:group-hover/cta:translate-x-5.25')}
      >
        {children}
      </span>
      <HugeiconsIcon
        aria-hidden="true"
        className={cn(
          MOVE,
          'ml-1 size-4.25 motion-safe:group-hover/cta:translate-x-4 motion-safe:group-hover/cta:opacity-0'
        )}
        icon={icon}
        size={17}
        strokeWidth={1.8}
      />
    </Link>
  )
}
