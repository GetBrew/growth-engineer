'use client'

import type { ReactNode } from 'react'
import type { CompanyAvatar } from '@/components/common/company-avatars'
import { CopyButton } from '@/components/common/copy-button'
import { useRecordCopy } from '@/components/detail/copy-count'
import { showFileCopiedToast } from '@/components/detail/copy-file-button'
import { PANEL_HEADING } from '@/components/detail/styles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'

const VIEW = 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6'

/**
 * The file, two ways — its page and its markdown — with a copy button of its
 * own, counted like the page's Copy on a workflow. The PREVIEW arrives already
 * rendered from the server (`MarkdownPreview`), so this client shell only
 * switches tabs.
 */
export function MarkdownFile({
  markdown,
  fileName,
  preview,
  companies,
}: {
  markdown: string
  fileName?: string
  preview: ReactNode
  companies?: ReadonlyArray<CompanyAvatar>
}) {
  const recordCopy = useRecordCopy()
  return (
    <Tabs className="gap-3" defaultValue="preview">
      {fileName ? (
        <h2 className={cn(PANEL_HEADING, 'min-w-0')}>
          <span className="truncate">{fileName}</span>
        </h2>
      ) : null}

      <div className="rounded-xl border bg-background">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <TabsList size="sm">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          <CopyButton
            label="markdown"
            onCopied={() => {
              showFileCopiedToast('Markdown', companies)
              recordCopy?.()
            }}
            text={markdown}
          />
        </div>
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
