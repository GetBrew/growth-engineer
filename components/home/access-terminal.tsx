import type { CSSProperties } from 'react'
import styles from './access-terminal.module.css'

/**
 * The three ways in, as the session an agent actually runs: one command, then
 * what the file hands back. Every string is a real value from the catalog —
 * Brew's own MCP server, a tool's CLI call, a tool's API route — so the block
 * is a demonstration rather than a picture of one.
 */
const LINES: Array<{ id: string; label?: string; value: string }> = [
  { id: 'mcp', label: 'MCP', value: 'https://brew.new/api/mcp' },
  { id: 'cli', label: 'CLI', value: 'claude classify-signals' },
  { id: 'api', label: 'API', value: 'POST /send-email' },
]

export function AccessTerminal() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-surface">
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        {['one', 'two', 'three'].map((dot) => (
          <span className="size-2.5 rounded-full bg-border" key={dot} />
        ))}
      </div>

      <div className="flex flex-col gap-2 p-4 font-mono">
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
            <span aria-hidden="true" className="text-verified">
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
