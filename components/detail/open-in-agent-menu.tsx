'use client'

import {
  ArrowDown01Icon,
  Copy01Icon,
  Download01Icon,
  LinkSquare02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

/**
 * "Explore with AI": open the file in ChatGPT or Claude, copy it, or download
 * it. Hand-rolled on purpose: a menu primitive adds ~45 KB to every page this
 * is on, for four links. So it is a disclosure, not an ARIA menu — the items
 * are ordinary links and buttons in the tab order, and Escape, a click
 * outside or tabbing away closes it.
 */
export function OpenInAgentMenu({
  markdown,
  filePath,
  title,
}: {
  markdown: string
  filePath: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const { copy } = useCopy()

  useEffect(() => {
    if (!open) {
      return
    }
    // A click or a tab to anything outside closes it.
    const onOutside = (event: Event) => {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('focusin', onOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('focusin', onOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const prompt = encodeURIComponent(
    `Set up and run this for me:\n\n${markdown}`
  )
  const agents = [
    { label: 'Open in ChatGPT', href: `https://chatgpt.com/?q=${prompt}` },
    { label: 'Open in Claude', href: `https://claude.ai/new?q=${prompt}` },
  ]
  const itemClass =
    'type-control flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-soft outline-none hover:bg-hover hover:text-foreground focus-visible:bg-hover focus-visible:text-foreground'
  const close = () => setOpen(false)

  return (
    // On phones the primary action takes the rest of the row.
    <div className="relative max-sm:flex-1" ref={container}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={cn(buttonVariants({ size: 'pill' }), 'max-sm:w-full')}
        onClick={() => setOpen((value) => !value)}
        ref={trigger}
        type="button"
      >
        <HugeiconsIcon
          aria-hidden="true"
          className="size-4"
          icon={SparklesIcon}
        />
        Explore with AI
        <HugeiconsIcon
          aria-hidden="true"
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          icon={ArrowDown01Icon}
        />
      </button>
      {open ? (
        <div
          className="floating-panel absolute top-13 right-0 z-30 w-72 rounded-2xl p-2.5"
          id={panelId}
        >
          {agents.map((agent) => (
            <a
              className={itemClass}
              href={agent.href}
              key={agent.label}
              onClick={close}
              rel="noreferrer"
              target="_blank"
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-4"
                icon={LinkSquare02Icon}
              />
              {agent.label}
            </a>
          ))}
          <button
            className={itemClass}
            onClick={() => {
              copy(markdown)
              close()
            }}
            type="button"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="size-4"
              icon={Copy01Icon}
            />
            Copy for any agent
          </button>
          <a
            className={itemClass}
            download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}
            href={filePath}
            onClick={close}
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="size-4"
              icon={Download01Icon}
            />
            Download .md
          </a>
        </div>
      ) : null}
    </div>
  )
}
