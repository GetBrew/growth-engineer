'use client'

import Link from 'next/link'
import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from 'react'
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

// "USES 1 · +1 this week · #1 on Hot": one quiet row on every screen.
const SECTION = 'flex flex-wrap items-baseline gap-x-2 gap-y-1'

const VALUE = 'type-label font-medium text-foreground tabular-nums'

/**
 * "Uses": how many times the file was copied into an agent, with this week's
 * copies — its velocity — and its place on Hot when it has one.
 */
export function UsesStat({
  total,
  week,
  hotPlace,
}: {
  total: number
  week: number
  hotPlace: number | null
}) {
  const added = useContext(CopyCountContext)?.added ?? 0
  const uses = total + added
  const thisWeek = week + added
  return (
    <section className={SECTION}>
      <h2 className={SIDE_HEADING}>Uses</h2>
      {/* "Uses" already says what it counts; a rounded 1.2K keeps the exact
          count in its title. */}
      <p
        className={VALUE}
        title={
          formatCount(uses) === formatExact(uses)
            ? undefined
            : `${formatExact(uses)} uses`
        }
      >
        {formatCount(uses)}
      </p>
      {thisWeek > 0 ? (
        // The "·" is CSS, so it never ends up in copied text.
        <p className="type-label text-subtle before:mr-2 before:text-faint before:content-['·']">
          +{formatExact(thisWeek)} this week
          {hotPlace ? (
            <>
              {' · '}
              <Link
                className="focus-ring rounded-sm text-soft underline-offset-4 hover:text-foreground hover:underline"
                href="/workflows?sort=hot"
              >
                #{hotPlace} on Hot
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  )
}

/**
 * The stat's place while its number streams in: the label and an empty line
 * of the number's height — no pulse, no spinner, and nothing moves when it
 * lands.
 */
export function UsesStatFallback() {
  return (
    <section aria-hidden="true" className={SECTION}>
      <h2 className={SIDE_HEADING}>Uses</h2>
      <p className={VALUE}>&nbsp;</p>
    </section>
  )
}
