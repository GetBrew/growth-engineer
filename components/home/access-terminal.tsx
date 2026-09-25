import type { CSSProperties } from 'react'
import styles from './access-terminal.module.css'

const LINES: Array<{ id: string; label?: string; value: string }> = [
  { id: 'mcp', label: 'MCP', value: MCP_URL },
  { id: 'cli', label: 'CLI', value: 'claude classify-signals' },
  { id: 'api', label: 'API', value: 'POST /send-email' },
]

import { MCP_URL } from '@/lib/constants/site'
export function AccessTerminal() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-surface">
      <div className="flex items-center gap-1.5 border-b px-4 py-2">
        {['one', 'two', 'three'].map((dot) => (
          <span className="size-2.5 rounded-full bg-border" key={dot} />
        ))}
      </div>

      <div className="flex flex-col gap-1 px-4 py-2.5 font-mono">
        <p
          className={`${styles.line} type-label`}
          style={{ '--index': 0 } as CSSProperties}
        >
          <span className="text-faint">$ </span>
          npx growth.engineer add at-risk-customer-rescue
        </p>

        {LINES.map((line, index) => (
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
          style={{ '--index': LINES.length + 1 } as CSSProperties}
        >
          Ready. Any agent can run it.
          <span className={`${styles.caret} ml-1 text-foreground`}>▋</span>
        </p>
      </div>
    </div>
  )
}
