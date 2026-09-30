import type { CSSProperties } from 'react'
import { refToFilePath } from '@/lib/catalog/keys'
import { loadWorkflow, loadWorkflows } from '@/lib/catalog/loaders'
import { orderAccess } from '@/lib/catalog/render-access'
import { SITE_ORIGIN } from '@/lib/env'
import styles from './access-terminal.module.css'

const EXAMPLE_WORKFLOW = 'high-intent-visitors'

export function AccessTerminal() {
  const result = loadExample()
  if (!result) {
    return null
  }
  const fileUrl = `${SITE_ORIGIN}${refToFilePath({ type: 'workflow', key: result.workflow.key })}`
  const lines = result.tools.flatMap(({ tool }) => {
    const [best] = orderAccess(tool.access)
    return best
      ? [
          {
            id: tool.key,
            label: best.type.toUpperCase(),
            operation: best.operation,
          },
        ]
      : []
  })

  return (
    <div className="@container overflow-hidden rounded-2xl border bg-surface">
      <div className="flex items-center gap-1.5 border-b px-4 py-2">
        {['one', 'two', 'three'].map((dot) => (
          <span className="size-2.5 rounded-full bg-border" key={dot} />
        ))}
      </div>

      <div className="grid grid-cols-[auto_auto_minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-2.5 font-mono">
        <p
          className={`${styles.line} type-label col-span-full truncate`}
          style={{ '--index': 0 } as CSSProperties}
        >
          <span className="text-faint">$ </span>
          curl {fileUrl}
        </p>

        {lines.map((line, index) => (
          <p
            className={`${styles.line} type-label col-span-full grid grid-cols-subgrid items-center`}
            key={line.id}
            style={{ '--index': index + 1 } as CSSProperties}
            title={`${line.label} ${line.id} · ${line.operation}`}
          >
            <span aria-hidden="true" className="text-success">
              ✔
            </span>
            <span className="text-foreground">{line.label}</span>
            <span className="truncate text-soft">{line.id}</span>
            <span className="@xl:block hidden truncate text-faint">
              {line.operation}
            </span>
          </p>
        ))}

        <p
          className={`${styles.line} type-label col-span-full text-faint`}
          style={{ '--index': lines.length + 1 } as CSSProperties}
        >
          Ready. Any agent can run it.
          <span className={`${styles.caret} ml-1 text-foreground`}>▋</span>
        </p>
      </div>
    </div>
  )
}

function loadExample() {
  const example = loadWorkflow(EXAMPLE_WORKFLOW)
  if (example) {
    return example
  }
  const [featured] = loadWorkflows('featured', 1)
  return featured ? loadWorkflow(featured.workflow.key) : null
}
