import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export function BrandMark({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <Link
      aria-label="growth.engineer home"
      className={cn(
        'focus-ring flex shrink-0 items-center gap-2.5 rounded-full',
        className
      )}
      href="/"
    >
      <Image
        alt=""
        className="size-8 object-contain"
        height={32}
        priority
        src="/logo.png"
        width={32}
      />
      {showWordmark ? (
        <span className="type-item hidden sm:block">growth.engineer</span>
      ) : null}
    </Link>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link
      aria-label="growth.engineer home"
      className={cn(
        'focus-ring inline-flex items-center gap-2.5 rounded-full',
        className
      )}
      href="/"
    >
      <Image
        alt=""
        className="size-8 object-contain"
        height={32}
        src="/logo.png"
        width={32}
      />
      <span className="flex flex-col items-start">
        <span className="type-item">growth.engineer</span>
        <span className="type-label mt-0.5 flex items-center gap-1.5 text-subtle">
          Brought to you by
          <span className="relative block h-4 w-12">
            <Image
              alt="Brew"
              className="object-contain"
              fill
              sizes="48px"
              src="/logos/brew.svg"
            />
          </span>
        </span>
      </span>
    </Link>
  )
}
