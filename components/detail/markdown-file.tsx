'use client'

import type { ReactNode } from 'react'
import { PANEL_HEADING } from '@/components/detail/styles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'

const VIEW = 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6'

/**
 * The file, two ways — its page and its markdown. Copy and Download live in
 * the page header, once. The PREVIEW arrives already rendered from the server
 * (`MarkdownPreview`), so this client shell only switches tabs.
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
  return (
    <Tabs className="gap-3" defaultValue="preview">
      <div className="flex items-center justify-between gap-4">
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
