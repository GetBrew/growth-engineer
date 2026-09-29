'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from 'react'
import { formatCount, formatExact } from '@/lib/usage/stats'

type CopyCount = { added: number; record: () => void }

const CopyCountContext = createContext<CopyCount | null>(null)

/**
 * Reports a copy made on a workflow's page — once per page view, however many
 * times the button is pressed — and adds it to the count shown here only when
 * the server says it counted: a visitor counts once a day per workflow
 * (lib/usage/copies.ts), so a second copy tomorrow counts, a tenth today
 * does not. `keepalive` lets the report outlive a navigation away.
 */
export function CopyCountProvider({
  workflowKey,
  isCounting,
  children,
}: {
  workflowKey: string
  /** False when this deployment has no store: nothing is sent. */
  isCounting: boolean
  children: ReactNode
}) {
  const [added, setAdded] = useState(0)
  const hasReported = useRef(false)
  const record = () => {
    if (!isCounting || hasReported.current) {
      return
    }
    hasReported.current = true
    fetch(`/api/workflows/${workflowKey}/copies`, {
      method: 'POST',
      keepalive: true,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { counted?: boolean } | null) => {
        if (body?.counted) {
          setAdded(1)
        }
      })
      .catch(() => undefined)
  }
  return (
    <CopyCountContext value={{ added, record }}>{children}</CopyCountContext>
  )
}

/** Counts a copy on a page that counts them; `undefined` anywhere else. */
export function useRecordCopy(): (() => void) | undefined {
  return useContext(CopyCountContext)?.record
}

/** One quiet line under the actions. */
const LINE = 'type-helper text-soft'

/** "Not copied yet", "Copied once", "Copied 1.2K times". */
function copiedText(copies: number): string {
  if (copies === 0) {
    return 'Not copied yet'
  }
  return copies === 1 ? 'Copied once' : `Copied ${formatCount(copies)} times`
}

/**
 * How many times the file was copied into an agent, counting this page's own
 * copy once the server has. A rounded 1.2K keeps the exact count in its title.
 */
export function UsesStat({ total }: { total: number }) {
  const added = useContext(CopyCountContext)?.added ?? 0
  const copies = total + added
  return (
    <p
      className={LINE}
      title={
        formatCount(copies) === formatExact(copies)
          ? undefined
          : `Copied ${formatExact(copies)} times`
      }
    >
      {copiedText(copies)}
    </p>
  )
}

/**
 * The line's place while the count streams in: empty, at the line's height,
 * so nothing moves when it lands. No pulse, no spinner.
 */
export function UsesStatFallback() {
  return (
    <p aria-hidden="true" className={LINE}>
      &nbsp;
    </p>
  )
}
