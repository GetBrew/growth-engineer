import { BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { SlideIconLink } from '@/components/ui/slide-icon-link'
import { cn } from '@/lib/utils/cn'

// Home for now, until the founders page exists.
const FOUNDERS_HREF = '/'
export function FoundersCta() {
  return (
    <SlideIconLink href={FOUNDERS_HREF} icon={BubbleChatIcon}>
      Talk to Founders
    </SlideIconLink>
  )
}

export function FoundersCtaStatic({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      className={cn(buttonVariants({ size: 'pill' }), className)}
      href={FOUNDERS_HREF}
      onClick={onClick}
    >
      Talk to Founders
      <HugeiconsIcon
        aria-hidden="true"
        icon={BubbleChatIcon}
        size={16}
        strokeWidth={1.8}
      />
    </Link>
  )
}
