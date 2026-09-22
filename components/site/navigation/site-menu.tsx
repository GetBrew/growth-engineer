'use client'

import {
  ArrowRight01Icon,
  Cancel01Icon,
  Menu02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetBackdrop,
  SheetClose,
  SheetPopup,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { POP_IN, POP_OUT } from '@/lib/motion'
import { NAV_ITEMS } from './nav-items'

export function SiteMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <MotionConfig
      transition={
        shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: POP_IN }
      }
    >
      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <div className="relative">
          <SheetTrigger render={<Button size="icon-pill" variant="ghost" />}>
            <HugeiconsIcon
              aria-hidden="true"
              icon={Menu02Icon}
              size={20}
              strokeWidth={1.8}
            />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <MenuCursor animate={!shouldReduceMotion} />
        </div>

        <AnimatePresence>
          {isOpen ? (
            <SheetPortal keepMounted>
              <SheetBackdrop
                className="bg-background/50 backdrop-blur-sm"
                render={
                  <motion.div
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    initial={{ opacity: 0 }}
                  />
                }
              />
              <SheetPopup
                className="inset-y-0 left-0 w-[min(23rem,90vw)] border-r bg-surface shadow-xl"
                render={
                  <motion.aside
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                      opacity: 0,
                      x: '-100%',
                      transition: { duration: 0.2, ease: POP_OUT },
                    }}
                    initial={{ opacity: 0, x: '-100%' }}
                  />
                }
              >
                <div className="flex h-header items-center justify-between gap-4 border-b border-dashed px-5 sm:px-7">
                  <SheetTitle className="type-item">growth.engineer</SheetTitle>
                  <SheetClose
                    render={<Button size="icon-pill" variant="ghost" />}
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      icon={Cancel01Icon}
                      size={20}
                      strokeWidth={1.8}
                    />
                    <span className="sr-only">Close menu</span>
                  </SheetClose>
                </div>

                <nav
                  aria-label="Main menu"
                  className="flex flex-1 flex-col gap-9 overflow-y-auto px-5 py-8 sm:px-7"
                >
                  <MenuGroup label="Dashboard">
                    <MenuLink href="/" onSelect={() => setIsOpen(false)}>
                      Home
                    </MenuLink>
                  </MenuGroup>

                  <MenuGroup label="Explore">
                    {NAV_ITEMS.map((item) => (
                      <MenuLink
                        href={item.href}
                        key={item.href}
                        onSelect={() => setIsOpen(false)}
                        showArrow
                      >
                        {item.label}
                      </MenuLink>
                    ))}
                  </MenuGroup>

                  <MenuGroup label="Company">
                    <MenuLink href="/submit" onSelect={() => setIsOpen(false)}>
                      Submit a workflow
                    </MenuLink>
                    <MenuLink
                      href="https://brew.new"
                      onSelect={() => setIsOpen(false)}
                    >
                      About Brew
                    </MenuLink>
                  </MenuGroup>
                </nav>

                <div className="border-t border-dashed p-5 sm:p-7">
                  <a
                    className={buttonVariants({ size: 'pill' })}
                    href="mailto:founders@brew.new"
                    onClick={() => setIsOpen(false)}
                  >
                    Talk to founders
                  </a>
                  <p className="type-label mt-5 text-muted-foreground">
                    Tools and workflows for growth teams.
                  </p>
                </div>
              </SheetPopup>
            </SheetPortal>
          ) : null}
        </AnimatePresence>
      </Sheet>
    </MotionConfig>
  )
}

function MenuGroup({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label px-3 text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function MenuLink({
  children,
  href,
  onSelect,
  showArrow = false,
}: {
  children: ReactNode
  href: string
  onSelect: () => void
  showArrow?: boolean
}) {
  return (
    <Link
      className="type-item flex h-11 items-center rounded-xl px-3 transition-colors hover:bg-muted"
      href={href}
      onClick={onSelect}
    >
      {children}
      {showArrow ? (
        <HugeiconsIcon
          aria-hidden="true"
          className="ml-auto"
          icon={ArrowRight01Icon}
          size={17}
          strokeWidth={1.8}
        />
      ) : null}
    </Link>
  )
}

const TAP = {
  duration: 1.2,
  repeat: Number.POSITIVE_INFINITY,
  repeatDelay: 1,
  ease: 'easeInOut',
  times: [0, 0.4, 1],
} as const

function MenuCursor({ animate }: { animate: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {animate ? (
        <motion.span
          animate={{ opacity: [0, 0.35, 0], scale: [0.6, 0.6, 1.3] }}
          className="absolute inset-0 rounded-full border border-foreground"
          transition={{ ...TAP, times: [...TAP.times] }}
        />
      ) : null}

      <motion.svg
        animate={
          animate
            ? { x: [0, -3, 0], y: [0, -3, 0], scale: [1, 0.85, 1] }
            : undefined
        }
        className="absolute top-1/2 left-1/2 size-5 origin-top-left drop-shadow"
        transition={{ ...TAP, times: [...TAP.times] }}
        viewBox="0 0 24 24"
      >
        <path
          className="fill-foreground stroke-background"
          d="M4 3.5 19.5 10l-6.6 2.2-2.4 6.8L4 3.5Z"
          strokeLinejoin="round"
          strokeWidth={1.6}
        />
      </motion.svg>
    </span>
  )
}
