'use client'

import {
  ArrowDown01Icon,
  Download01Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  DETAIL_ACTION_ICON,
  HEADER_ACTION_COLLAPSING,
} from '@/components/detail/styles'
import { cn } from '@/lib/utils/cn'

/**
 * A chat link carries its prompt in the URL, and long URLs get cut. Past this
 * many encoded characters the prompt points at the file instead of holding it.
 */
const MAX_PROMPT_CHARS = 8000

/** The same file the Copy button copies — or, when it is long, where it lives. */
function agentPrompt(markdown: string, fileUrl: string | undefined): string {
  const inline = encodeURIComponent(markdown)
  if (!fileUrl || inline.length <= MAX_PROMPT_CHARS) {
    return inline
  }
  return encodeURIComponent(
    `Fetch ${fileUrl} and run it for me: set up the tools it names, ask me for its inputs, then follow its steps and its rules.`
  )
}

/**
 * "Open in": the file in ChatGPT or Claude, or downloaded. Copying is the
 * page's primary button. Hand-rolled on purpose: a menu primitive adds ~45 KB
 * to every page this is on, for three links. So it is a disclosure, not an
 * ARIA menu — the items are ordinary links in the tab order, and Escape, a
 * click outside or tabbing away closes it.
 */
export function OpenInAgentMenu({
  markdown,
  filePath,
  fileUrl,
  title,
}: {
  markdown: string
  /** What Download saves: the `.md` path, or a data URL. */
  filePath: string
  /** The file's absolute URL, for a prompt too long to carry inline. */
  fileUrl?: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

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

  const prompt = agentPrompt(markdown, fileUrl)
  const agents = [
    { label: 'Open in ChatGPT', href: `https://chatgpt.com/?q=${prompt}` },
    { label: 'Open in Claude', href: `https://claude.ai/new?q=${prompt}` },
  ]
  const itemClass =
    'type-control flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-soft hover:bg-hover hover:text-foreground focus-ring focus-visible:bg-hover focus-visible:text-foreground'
  const close = () => setOpen(false)

  return (
    <div className="relative" ref={container}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={HEADER_ACTION_COLLAPSING}
        onClick={() => setOpen((value) => !value)}
        ref={trigger}
        type="button"
      >
        <HugeiconsIcon
          aria-hidden="true"
          icon={LinkSquare02Icon}
          size={DETAIL_ACTION_ICON}
          strokeWidth={1.8}
        />
        <span className="max-sm:sr-only">Open in</span>
        <HugeiconsIcon
          aria-hidden="true"
          className={cn(
            'size-3.5 transition-transform max-sm:hidden',
            open && 'rotate-180'
          )}
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
