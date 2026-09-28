'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import { SIDE_HEADING } from '@/components/detail/styles'

type CopyCount = { count: number | null; record: () => void }

const CopyCountContext = createContext<CopyCount | null>(null)

/**
 * A workflow page's copy count: the number prerendered with the page
 * (lib/usage/copies.ts), plus the copies made here, so a copy shows at once
 * rather than on the next refresh. Each copy is sent with `sendBeacon`, which
 * nothing waits on.
 */
export function CopyCountProvider({
  workflowKey,
  count,
  children,
}: {
  workflowKey: string
  /** `null` when this deployment has no count: the stat is hidden. */
  count: number | null
  children: ReactNode
}) {
  const [added, setAdded] = useState(0)
  const record = () => {
    navigator.sendBeacon(`/api/workflows/${workflowKey}/copies`)
    setAdded((value) => value + 1)
  }
  return (
    <CopyCountContext
      value={{ count: count === null ? null : count + added, record }}
    >
      {children}
    </CopyCountContext>
  )
}

/** Counts a copy on a page that counts them; `undefined` anywhere else. */
export function useRecordCopy(): (() => void) | undefined {
  return useContext(CopyCountContext)?.record
}

const COMPACT = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const EXACT = new Intl.NumberFormat('en-US')

/** "Uses": how many times the file was copied into an agent. */
export function CopyCountStat() {
  const count = useContext(CopyCountContext)?.count
  if (count === null || count === undefined) {
    return null
  }
  return (
    <section className="flex flex-col gap-2">
      <h2 className={SIDE_HEADING}>Uses</h2>
      <p className="font-medium text-[32px] tabular-nums leading-none tracking-tight">
        <span aria-hidden="true">{COMPACT.format(count)}</span>
        <span className="sr-only">
          Copied {EXACT.format(count)} {count === 1 ? 'time' : 'times'}
        </span>
      </p>
    </section>
  )
}
