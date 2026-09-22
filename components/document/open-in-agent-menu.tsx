'use client'

import {
  ArrowDown01Icon,
  Copy01Icon,
  Download01Icon,
  LinkSquare02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'

/**
 * "Explore with AI": hand the file to an agent without leaving the page. The
 * two web agents take the whole prompt in a query string; the others copy or
 * download the same bytes.
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

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
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
    'type-control flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-soft hover:bg-hover hover:text-foreground'

  function copyForAgent() {
    navigator.clipboard.writeText(markdown).catch(() => undefined)
    setOpen(false)
  }

  return (
    <div className="relative" ref={container}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={`ai-metallic-trigger focus-ring type-control flex h-11 items-center gap-2 rounded-full px-5 ${open ? 'text-white' : 'text-soft'}`}
        data-popup-open={open ? '' : undefined}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <HugeiconsIcon
          icon={SparklesIcon}
          aria-hidden="true"
          className="size-4"
        />
        Explore with AI
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div
          className="floating-panel absolute top-13 right-0 z-30 w-72 rounded-2xl p-2.5"
          role="menu"
        >
          {agents.map((agent) => (
            <a
              className={itemClass}
              href={agent.href}
              key={agent.label}
              rel="noreferrer"
              role="menuitem"
              target="_blank"
            >
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                aria-hidden="true"
                className="size-4"
              />
              {agent.label}
            </a>
          ))}
          <button
            className={itemClass}
            onClick={copyForAgent}
            role="menuitem"
            type="button"
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              aria-hidden="true"
              className="size-4"
            />
            Copy for any agent
          </button>
          <a
            className={itemClass}
            download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}
            href={filePath}
            role="menuitem"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              aria-hidden="true"
              className="size-4"
            />
            Download .md
          </a>
        </div>
      ) : null}
    </div>
  )
}
