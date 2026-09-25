import Image from 'next/image'
import { BREW_URL } from '@/lib/constants/site'
import { cn } from '@/lib/utils/cn'

export function BrewLink({ className }: { className?: string }) {
  return (
    <a
      aria-label="Brew"
      className={cn(
        'focus-ring relative block h-4 w-12 rounded-sm opacity-80 transition-opacity hover:opacity-100',
        className
      )}
      href={BREW_URL}
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
