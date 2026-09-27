'use client'

import {
  CodeSquareIcon,
  Copy01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'
import {
  DETAIL_ACTION,
  DETAIL_ACTION_ICON,
  PANEL_HEADING,
} from '@/components/detail/styles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

const VIEW = 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6'
const ACTION = cn(DETAIL_ACTION, 'max-sm:px-2.5')

/**
 * The file, two ways — its page and its markdown — with Copy and Download.
 * The PREVIEW arrives already rendered from the server (`MarkdownPreview`),
 * so this client shell only switches tabs and handles the clipboard.
 */
export function MarkdownFile({
  markdown,
  fileName,
  preview,
}: {
  markdown: string
  fileName: string
  preview: ReactNode
}) {
  const { copied, copy } = useCopy()

  function download() {
    const url = URL.createObjectURL(
      new Blob([markdown], { type: 'text/markdown' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    // Revoking at once can cancel the download in Firefox and Safari.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Tabs className="gap-3" defaultValue="preview">
      {/* Phones give the name its own row, then the tabs with icon-only
          actions beside them; from sm up it is one row again. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h2 className={cn(PANEL_HEADING, 'min-w-0')}>
          <span className="truncate">{fileName}</span>
        </h2>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <TabsList className="h-9 shrink-0 p-0.5">
            <TabsTrigger className="h-8 px-3" value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger className="h-8 px-3" value="markdown">
              Markdown
            </TabsTrigger>
          </TabsList>

          <div className="-mr-3 flex shrink-0 items-center">
            <button
              className={ACTION}
              onClick={() => copy(markdown)}
              type="button"
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={copied ? Tick02Icon : Copy01Icon}
                size={DETAIL_ACTION_ICON}
                strokeWidth={1.8}
              />
              <span className="max-sm:sr-only">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
            <button className={ACTION} onClick={download} type="button">
              <HugeiconsIcon
                aria-hidden="true"
                icon={CodeSquareIcon}
                size={DETAIL_ACTION_ICON}
                strokeWidth={1.8}
              />
              <span className="max-sm:sr-only">Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background">
        <TabsContent value="preview">
          <div className={VIEW}>{preview}</div>
        </TabsContent>

        <TabsContent value="markdown">
          <pre className={`${VIEW} overflow-x-auto`}>
            <code className="type-label font-mono text-soft">{markdown}</code>
          </pre>
        </TabsContent>
      </div>
    </Tabs>
  )
}
