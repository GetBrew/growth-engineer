'use client'

import {
  CodeSquareIcon,
  Copy01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ReactNode, useState } from 'react'
import {
  DETAIL_ACTION,
  DETAIL_ACTION_ICON,
  PANEL_HEADING,
} from '@/components/detail/styles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'

const VIEW = 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6'

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
  const [copied, setCopied] = useState(false)

  async function copy() {
    const didCopy = await navigator.clipboard
      .writeText(markdown)
      .then(() => true)
      .catch(() => false)
    if (didCopy) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <h2 className={cn(PANEL_HEADING, 'min-w-0')}>
            <span className="truncate">{fileName}</span>
          </h2>

          <TabsList className="h-9 shrink-0 p-0.5">
            <TabsTrigger className="h-8 px-3" value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger className="h-8 px-3" value="markdown">
              Markdown
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="-mr-3 flex shrink-0 items-center">
          <button className={DETAIL_ACTION} onClick={copy} type="button">
            <HugeiconsIcon
              aria-hidden="true"
              icon={copied ? Tick02Icon : Copy01Icon}
              size={DETAIL_ACTION_ICON}
              strokeWidth={1.8}
            />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className={DETAIL_ACTION} onClick={download} type="button">
            <HugeiconsIcon
              aria-hidden="true"
              icon={CodeSquareIcon}
              size={DETAIL_ACTION_ICON}
              strokeWidth={1.8}
            />
            Download
          </button>
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
