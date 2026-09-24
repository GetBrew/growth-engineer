import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

/** The Brew wordmark, linked. Used wherever the site credits who made it. */
export function BrewLink({ className }: { className?: string }) {
  return (
    <a
      aria-label="Brew"
      className={cn(
        'focus-ring relative block h-4 w-12 rounded-sm opacity-80 transition-opacity hover:opacity-100',
        className
      )}
      href="https://brew.new"
      rel="noreferrer"
      target="_blank"
    >
      <Image
        alt="Brew"
        className="object-contain"
        fill
        sizes="48px"
        src="/logos/brew.svg"
      />
    </a>
  )
}
