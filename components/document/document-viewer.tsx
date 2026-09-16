import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { CopyPromptButton } from './copy-prompt-button'
import { OpenInAgentMenu } from './open-in-agent-menu'

/**
 * The file, exactly as copied, with the two actions that matter. A Server
 * Component: the markdown is rendered once on the server with the same tint
 * scheme as the data-model doc, and only the buttons ship JavaScript.
 */

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*)/
const HEADING = /^#{1,4} /
const LIST_MARKER = /^(\d+\.|-) /

function inline(text: string): ReactNode {
  return text.split(INLINE).map((part, index) => {
    const key = index
    if (part === '') {
      return null
    }
    if (part.startsWith('`') && part.length > 1) {
      return (
        <span className="ic" key={key}>
          {part}
        </span>
      )
    }
    if (part.startsWith('**')) {
      return (
        <span className="b" key={key}>
          {part}
        </span>
      )
    }
    return <span key={key}>{part}</span>
  })
}

type LineState = { frontmatter: 0 | 1 | 2; inCode: boolean }

function frontmatterLine(line: string): ReactNode {
  const colon = line.indexOf(':')
  if (colon <= 0) {
    return <span className="fm">{line}</span>
  }
  return (
    <span className="fm">
      <span className="k">{line.slice(0, colon + 1)}</span>
      {line.slice(colon + 1)}
    </span>
  )
}

function headingLine(line: string): ReactNode {
  const mark = line.slice(0, line.indexOf(' ') + 1)
  return (
    <span className={cn('h', { h1: mark.length === 2 })}>
      <span className="mark">{mark}</span>
      {line.slice(mark.length)}
    </span>
  )
}

function listLine(line: string): ReactNode {
  const marker = line.slice(0, line.indexOf(' '))
  return (
    <span>
      <span className="li">{marker}</span>
      {inline(line.slice(marker.length))}
    </span>
  )
}

/** One line, tinted by what it is. Mutates `state` as fences and the header pass. */
function renderLine(line: string, state: LineState): ReactNode {
  if (state.frontmatter < 2 && line === '---') {
    state.frontmatter = (state.frontmatter + 1) as 1 | 2
    return <span className="fm">{line}</span>
  }
  if (state.frontmatter === 1) {
    return frontmatterLine(line)
  }
  if (line.startsWith('```')) {
    state.inCode = !state.inCode
    return <span className="fence">{line}</span>
  }
  if (state.inCode) {
    return <span className="code">{line}</span>
  }
  if (HEADING.test(line)) {
    return headingLine(line)
  }
  if (LIST_MARKER.test(line)) {
    return listLine(line)
  }
  return <span>{inline(line)}</span>
}

function renderLines(markdown: string): Array<ReactNode> {
  const lines = markdown.trimEnd().split('\n')
  const state: LineState = { frontmatter: 0, inCode: false }
  return lines.map((line, index) => {
    const key = index
    return (
      <span key={key}>
        {renderLine(line, state)}
        {index < lines.length - 1 ? '\n' : null}
      </span>
    )
  })
}

export function DocumentViewer({
  markdown,
  filePath,
  lineCount,
  title,
}: {
  markdown: string
  /** `/tools/clay/clay.md` — shown, and what Download fetches. */
  filePath: string
  lineCount: number
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-foreground/20 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-border border-b px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-mono text-[12.5px]">{filePath}</span>
          <span className="text-[13px] text-foreground/55">
            {lineCount} lines · exactly what Copy prompt copies
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OpenInAgentMenu
            filePath={filePath}
            markdown={markdown}
            title={title}
          />
          <CopyPromptButton markdown={markdown} />
        </div>
      </div>
      <pre className="md-file max-h-[640px] overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[12.5px] leading-[1.75] [overflow-wrap:anywhere]">
        {renderLines(markdown)}
      </pre>
      <p className="border-border border-t px-4 py-3 text-[13px] text-foreground/55">
        Paste it into any agent to set up the tools and run the job. Agents can
        fetch this file directly at{' '}
        <code className="rounded bg-[#e9ecf2] px-1 font-mono text-[12px]">
          {filePath}
        </code>
        .
      </p>
    </section>
  )
}
