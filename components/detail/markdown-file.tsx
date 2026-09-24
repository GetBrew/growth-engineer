'use client'

import {
  CodeSquareIcon,
  Copy01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { Streamdown } from 'streamdown'
import {
  DETAIL_ACTION,
  DETAIL_ACTION_ICON,
  PANEL_HEADING,
} from '@/components/detail/chrome'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'

const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/

const HEADINGS = {
  h1: 'h2',
  h2: 'h3',
  h3: 'h4',
  h4: 'h5',
  h5: 'h6',
} as const

const VIEW = 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6'

export function MarkdownFile({
  markdown,
  fileName,
}: {
  markdown: string
  fileName: string
}) {
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
    <Tabs className="gap-3" defaultValue="preview">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={cn(PANEL_HEADING, 'min-w-0')}>
          <span className="truncate">{fileName}</span>
        </h2>

        {/* Ghost buttons carry their own padding; a gap on top of it reads
            as a gap between two unrelated things. */}
        <div className="-mr-3 flex items-center">
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
        {/* The switch lives inside the file, above whichever view it picks. */}
        <div className="flex justify-end px-5 pt-4 sm:px-6">
          <TabsList className="h-8 p-0.5">
            <TabsTrigger className="type-label h-7 px-3" value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger className="type-label h-7 px-3" value="markdown">
              Markdown
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview">
          <div className={VIEW}>
            <Streamdown
              className="type-body [&_h2]:type-item [&_h3]:type-subsection [&_h4]:type-control [&_table]:type-label [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:mt-7 [&_h3]:mb-2 [&_h4]:mt-5 [&_h4]:mb-1.5 [&_hr]:my-6 [&_li]:my-0.5 [&_p]:my-1.5"
              components={HEADINGS}
              controls={false}
              mode="static"
            >
              {markdown.replace(FRONTMATTER, '')}
            </Streamdown>
          </div>
        </TabsContent>

        {/* The file exactly as it sits in the repository, frontmatter included
            — that is what Copy and Download hand over. */}
        <TabsContent value="markdown">
          <pre className={`${VIEW} overflow-x-auto`}>
            <code className="type-label font-mono text-soft">{markdown}</code>
          </pre>
        </TabsContent>
      </div>
    </Tabs>
  )
}
