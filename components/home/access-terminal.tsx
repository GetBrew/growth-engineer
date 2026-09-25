import type { CSSProperties } from 'react'
import { refToFilePath } from '@/lib/catalog/keys'
import { loadWorkflow, loadWorkflows } from '@/lib/catalog/loaders'
import { orderAccess } from '@/lib/catalog/render-access'
import { SITE_ORIGIN } from '@/lib/env'
import styles from './access-terminal.module.css'

/**
 * A session that really works: fetching the top featured workflow's file,
 * then — from that same file — each tool it uses and the way in the file
 * sets up first. Every line is read from the catalog at build; nothing here
 * is a mock-up.
 */
export async function AccessTerminal() {
  const [featured] = await loadWorkflows('featured', 1)
  const result = featured
    ? await loadWorkflow(featured.workflow.key, undefined)
    : null
  if (!result) {
    return null
  }
  const fileUrl = `${SITE_ORIGIN}${refToFilePath({ type: 'workflow', key: result.workflow.key, version: undefined })}`
  const lines = result.tools.flatMap(({ tool }) => {
    const [best] = orderAccess(tool.access)
    return best
      ? [
          {
            id: tool.key,
            label: best.type.toUpperCase(),
            value: `${tool.key} · ${best.operation}`,
          },
        ]
      : []
  })

  return (
    <div className="overflow-hidden rounded-2xl border bg-surface">
      <div className="flex items-center gap-1.5 border-b px-4 py-2">
        {['one', 'two', 'three'].map((dot) => (
          <span className="size-2.5 rounded-full bg-border" key={dot} />
        ))}
      </div>

      <div className="flex flex-col gap-1 px-4 py-2.5 font-mono">
        <p
          className={`${styles.line} type-label truncate`}
          style={{ '--index': 0 } as CSSProperties}
        >
          <span className="text-faint">$ </span>
          curl {fileUrl}
        </p>

        {lines.map((line, index) => (
          <p
            className={`${styles.line} type-label flex items-center gap-2`}
            key={line.id}
            style={{ '--index': index + 1 } as CSSProperties}
          >
            <span aria-hidden="true" className="text-success">
              ✔
            </span>
            <span className="w-8 shrink-0 text-foreground">{line.label}</span>
            <span className="min-w-0 truncate text-soft">{line.value}</span>
          </p>
        ))}

        <p
          className={`${styles.line} type-label text-faint`}
          style={{ '--index': lines.length + 1 } as CSSProperties}
        >
          Ready. Any agent can run it.
          <span className={`${styles.caret} ml-1 text-foreground`}>▋</span>
        </p>
      </div>
    </div>
  )
}
