'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { NAV_ITEMS } from './nav-items'

/** Each character lifts on hover and its twin slides in from below. */
function SlidingText({ text }: { text: string }) {
  const characters = Array.from(text).map((character, index) => ({
    key: index,
    glyph: character === ' ' ? ' ' : character,
    delay: `${index * 18}ms`,
  }))
  return (
    <span className="nav-text align-middle">
      {characters.map(({ key, glyph, delay }) => (
        <span className="relative inline-block h-[1.25em]" key={key}>
          <span
            className="block transition-transform duration-300 ease-out group-hover/nav:-translate-y-full"
            style={{ transitionDelay: delay }}
          >
            {glyph}
          </span>
          <span
            aria-hidden="true"
            className="absolute top-full left-0 block transition-transform duration-300 ease-out group-hover/nav:-translate-y-full"
            style={{ transitionDelay: delay }}
          >
            {glyph}
          </span>
        </span>
      ))}
    </span>
  )
}

function isActive(pathname: string | null, href: string): boolean {
  return pathname === href || (pathname?.startsWith(`${href}/`) ?? false)
}

function Links({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const current = isActive(pathname, item.href)
        return (
          <Link
            aria-current={current ? 'page' : undefined}
            className={cn(
              'group/nav flex items-center rounded-full px-4 py-2 text-sm transition-colors',
              {
                'bg-black/5 font-medium text-foreground': current,
                'text-foreground/70 hover:bg-black/[0.04] hover:text-foreground':
                  !current,
              }
            )}
            href={item.href}
            key={item.href}
          >
            <SlidingText text={item.label} />
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * The primary nav with the active link marked. `usePathname()` is
 * request-time data, so the navbar mounts this inside a `<Suspense>` whose
 * fallback is <NavLinksStatic>: the same links, no active state, identical
 * layout — no pop, and the shell still prerenders.
 */
export function NavLinks() {
  return <Links pathname={usePathname()} />
}

export function NavLinksStatic() {
  return <Links pathname={null} />
}
