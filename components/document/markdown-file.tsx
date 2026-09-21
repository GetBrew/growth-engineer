'use client'

import {
  ArrowDown01Icon,
  CodeSquareIcon,
  Copy01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Streamdown } from 'streamdown'
import { buttonVariants } from '@/components/ui/button'
import { EXPO_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils/cn'

const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/
const ACTION = cn(
  buttonVariants({ variant: 'outline', size: 'pill' }),
  'text-soft hover:text-foreground'
)

/**
 * The workflow file, rendered for reading. Copy and Download hand over the
 * exact file; the preview drops the YAML frontmatter, which is for agents.
 */
export function MarkdownFile({
  markdown,
  fileName,
}: {
  markdown: string
  fileName: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(markdown).catch(() => undefined)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([markdown], { type: 'text/markdown' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border bg-surface p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          aria-expanded={open}
          className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 text-left"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <HugeiconsIcon
            aria-hidden="true"
            className={cn(
              'shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
            icon={ArrowDown01Icon}
            size={17}
            strokeWidth={1.8}
          />
          <span className="type-control truncate">{fileName}</span>
        </button>
        <div className="flex items-center gap-2">
          <button className={ACTION} onClick={copy} type="button">
            <HugeiconsIcon
              aria-hidden="true"
              icon={copied ? Tick02Icon : Copy01Icon}
              size={15}
              strokeWidth={1.8}
            />
            {copied ? 'Copied' : 'Copy markdown'}
          </button>
          <button className={ACTION} onClick={download} type="button">
            <HugeiconsIcon
              aria-hidden="true"
              icon={CodeSquareIcon}
              size={15}
              strokeWidth={1.8}
            />
            Download .md
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: EXPO_OUT }}
          >
            <div className="mt-3 max-h-[640px] overflow-y-auto overscroll-contain rounded-xl border bg-background p-5 sm:p-6">
              <Streamdown
                className="type-body [&_h1]:type-category [&_h2]:type-item [&_h3]:type-subsection [&_table]:type-label [&_h1]:mt-0 [&_h1]:mb-2 [&_h2]:mt-7 [&_h2]:mb-2 [&_h3]:mt-5 [&_h3]:mb-1.5 [&_hr]:my-6 [&_li]:my-0.5 [&_p]:my-1.5"
                controls={false}
                mode="static"
              >
                {markdown.replace(FRONTMATTER, '')}
              </Streamdown>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
