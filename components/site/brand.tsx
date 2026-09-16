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
        <span className="hidden font-semibold text-[15px] tracking-[-0.025em] sm:block">
          growth.engineer
        </span>
      ) : null}
    </Link>
  )
}

/** "Powered by Brew" — the one place the sponsor line is spelled. */
export function PoweredByBrew({ className }: { className?: string }) {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] text-foreground/60 transition-colors hover:text-foreground',
        className
      )}
      href="https://brew.new"
      rel="noreferrer"
      target="_blank"
    >
      <span>Powered by</span>
      <Image
        alt="Brew"
        className="size-4 rounded-sm object-contain"
        height={16}
        src="/logos/brew.jpeg"
        width={16}
      />
      <span className="font-medium text-foreground/80">Brew</span>
    </a>
  )
}
