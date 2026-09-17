'use client'

import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
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
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-foreground/70 text-sm hover:bg-black/[0.04] hover:text-foreground'

  function copyForAgent() {
    navigator.clipboard.writeText(markdown).catch(() => undefined)
    setOpen(false)
  }

  return (
    <div className="relative" ref={container}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={`ai-metallic-trigger focus-ring flex h-10 items-center gap-2 rounded-full px-4 text-sm ${open ? 'text-white' : 'text-foreground/70'}`}
        data-popup-open={open ? '' : undefined}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Sparkles aria-hidden="true" className="size-4" />
        Explore with AI
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div
          className="absolute top-12 right-0 z-30 w-64 rounded-2xl border border-border bg-white p-2 shadow-[0_18px_48px_rgba(0,0,0,0.12)]"
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
              <ExternalLink aria-hidden="true" className="size-4" />
              {agent.label}
            </a>
          ))}
          <button
            className={itemClass}
            onClick={copyForAgent}
            role="menuitem"
            type="button"
          >
            <Copy aria-hidden="true" className="size-4" />
            Copy for any agent
          </button>
          <a
            className={itemClass}
            download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}
            href={filePath}
            role="menuitem"
          >
            <Download aria-hidden="true" className="size-4" />
            Download .md
          </a>
        </div>
      ) : null}
    </div>
  )
}
