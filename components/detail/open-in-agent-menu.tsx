'use client'

import {
  ArrowDown01Icon,
  Download01Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import {
  DETAIL_ACTION_ICON,
  HEADER_ACTION_COLLAPSING,
} from '@/components/detail/styles'
import { MaskIcon } from '@/components/layout/mask-icon'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const MAX_PROMPT_CHARS = 8000

function agentPrompt(markdown: string, fileUrl: string | undefined): string {
  const inline = encodeURIComponent(markdown)
  if (!fileUrl || inline.length <= MAX_PROMPT_CHARS) {
    return inline
  }
  return encodeURIComponent(
    `Fetch ${fileUrl} and run it for me: set up the tools it names, ask me for its inputs, then follow its steps and its rules.`
  )
}

export function OpenInAgentMenu({
  markdown,
  filePath,
  fileUrl,
  title,
  sourceHref,
  isWide = false,
  className,
}: {
  markdown: string

  filePath: string
  fileUrl?: string
  title: string
  /** The file on GitHub: a last item, where a page has no button of its own. */
  sourceHref?: string
  /** A labelled outline button that fills its space (a workflow's, beside
      Copy), its menu opening from its right edge at every width. */
  isWide?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

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
  // Each opens a new chat with the file (or, past the URL budget, a line
  // pointing at it) already in the box; the logos are the agent strip's.
  const agents = [
    {
      label: 'ChatGPT',
      logo: '/marquee/openai.svg',
      href: `https://chatgpt.com/?q=${prompt}`,
    },
    {
      label: 'Claude',
      logo: '/marquee/claude.svg',
      href: `https://claude.ai/new?q=${prompt}`,
    },
    {
      label: 'Grok',
      logo: '/marquee/grok.svg',
      href: `https://grok.com/?q=${prompt}`,
    },
    {
      label: 'Cursor',
      logo: '/marquee/cursor.svg',
      href: `https://cursor.com/link/prompt?text=${prompt}`,
    },
  ]
  const itemClass =
    'type-control flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-soft hover:bg-hover hover:text-foreground focus-ring focus-visible:bg-hover focus-visible:text-foreground'
  const close = () => setOpen(false)

  return (
    <div className={cn('relative', className)} ref={container}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={
          isWide
            ? cn(buttonVariants({ variant: 'outline', size: 'pill' }), 'w-full')
            : HEADER_ACTION_COLLAPSING
        }
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
        <span className={isWide ? undefined : 'max-sm:sr-only'}>Open in</span>
        <HugeiconsIcon
          aria-hidden="true"
          className={cn(
            'size-3.5 transition-transform',
            !isWide && 'max-sm:hidden',
            open && 'rotate-180'
          )}
          icon={ArrowDown01Icon}
        />
      </button>
      {open ? (
        <div
          // Under lg the button leads its row, so the menu opens rightward
          // from it; from lg it ends the row, so the menu opens leftward.
          className={cn(
            'floating-panel absolute top-full z-30 mt-3 w-72 p-2',
            isWide ? 'right-0' : 'left-0 lg:right-0 lg:left-auto'
          )}
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
              <Image
                alt=""
                className="size-4 shrink-0 object-contain"
                height={16}
                src={agent.logo}
                width={16}
              />
              {agent.label}
            </a>
          ))}
          <div aria-hidden="true" className="mx-3 my-1 border-t" />
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
          {sourceHref ? (
            <a
              className={itemClass}
              href={sourceHref}
              onClick={close}
              rel="noreferrer"
              target="_blank"
            >
              <MaskIcon size={16} src="/social/github.svg" />
              View on GitHub
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
