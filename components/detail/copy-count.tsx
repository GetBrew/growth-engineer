'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from 'react'
import { UsageFigures } from '@/components/catalog/usage-figures'
import { SIDE_HEADING } from '@/components/detail/styles'
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

/**
 * The side column's Uses: a heading like Get started's, then the figures the
 * home page's list shows for the same workflow — "12 total", "+3 this week",
 * the heading naming them — counting this page's own copy once the server
 * has. A rounded 1.2K keeps the
 * exact count in its title.
 */
export function UsesStat({ total, week }: { total: number; week: number }) {
  const added = useContext(CopyCountContext)?.added ?? 0
  const copies = total + added
  return (
    <UsesSection>
      <p
        className="flex items-baseline gap-2"
        title={
          formatCount(copies) === formatExact(copies)
            ? undefined
            : `${formatExact(copies)} uses`
        }
      >
        {copies === 0 ? (
          <span className="type-helper text-soft">Not copied yet</span>
        ) : (
          <UsageFigures isUnderHeading total={copies} week={week + added} />
        )}
      </p>
    </UsesSection>
  )
}

/**
 * Its place while the count streams in: the heading, and an empty line at
 * the figures' height, so nothing moves when it lands. No pulse, no spinner.
 */
export function UsesStatFallback() {
  return (
    <UsesSection>
      <p aria-hidden="true" className="type-stat">
        &nbsp;
      </p>
    </UsesSection>
  )
}

/**
 * One line under lg — "Uses  2 total  +2 this week" — where the column stacks
 * under the buttons; from lg, a heading over its figures like Get started's.
 */
function UsesSection({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-baseline gap-2 lg:flex-col lg:items-start lg:gap-3">
      <h2 className={SIDE_HEADING}>Uses</h2>
      {children}
    </section>
  )
}
