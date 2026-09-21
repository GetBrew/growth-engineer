'use client'

import { ChevronRight, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NAV_ITEMS } from './nav-items'

/**
 * The mobile menu: a full-width sheet under the fixed header, not a dropdown.
 *
 * The one client island in the header — a sheet needs Escape, a scroll lock
 * and a close when the viewport grows past `lg`, and none of those exist in
 * CSS. It renders closed, so the header's static shell is unaffected. The
 * transition is CSS, with the same 220ms and easing as the rest of the site.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setOpen(false)
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const Icon = open ? X : Menu
  const itemClass =
    'flex items-center justify-between rounded-xl px-3 py-3 font-medium text-[15px] tracking-[-0.01em] transition-colors text-foreground/70 hover:bg-black/[0.04] hover:text-foreground'

  return (
    <>
      <button
        aria-controls="mobile-menu"
        aria-expanded={open}
        className="focus-ring ml-auto grid size-10 place-items-center rounded-full border border-border bg-white transition-colors hover:bg-black/[0.04] lg:hidden"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Icon aria-hidden="true" className="size-5" />
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>

      {open ? (
        <>
          {/*
            A button, not a div, so the backdrop is reachable without a
            mouse — and an EXPLICIT height, because a form control shrinks to
            its content instead of stretching between `top` and `bottom`.
          */}
          <button
            aria-label="Close menu"
            className="sheet-backdrop fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] bg-black/20 sm:top-20 sm:h-[calc(100dvh-5rem)] lg:hidden"
            onClick={close}
            tabIndex={-1}
            type="button"
          />
          <div
            className="sheet-panel fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-border border-b bg-white sm:top-20 sm:max-h-[calc(100dvh-5rem)] lg:hidden"
            id="mobile-menu"
          >
            <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 sm:px-6">
              <form action="/tools" className="relative block" method="get">
                <span className="sr-only">
                  Search tools, workflows and tags
                </span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-foreground/62"
                />
                <input
                  className="h-10 w-full rounded-full border-0 bg-black/5 pr-4 pl-11 text-sm outline-none placeholder:text-foreground/55"
                  name="q"
                  placeholder="Search tools, or type has:mcp"
                  type="search"
                />
              </form>

              <nav aria-label="Mobile" className="mt-3 grid">
                {NAV_ITEMS.map((item) => (
                  <Link
                    className={itemClass}
                    href={item.href}
                    key={item.href}
                    onClick={close}
                  >
                    {item.label}
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 text-foreground/55"
                    />
                  </Link>
                ))}
              </nav>

              <div className="mt-4 grid grid-cols-2 gap-2 border-border border-t pt-4">
                <Link
                  className="focus-ring flex h-10 items-center justify-center rounded-full border border-border bg-white font-medium text-sm transition-colors hover:bg-black/[0.04]"
                  href="/sign-in"
                  onClick={close}
                >
                  Sign in
                </Link>
                <Link
                  className="focus-ring flex h-10 items-center justify-center rounded-full bg-foreground font-medium text-background text-sm"
                  href="/submit"
                  onClick={close}
                >
                  Submit a workflow
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
