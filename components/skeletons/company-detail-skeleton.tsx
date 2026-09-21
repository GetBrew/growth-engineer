import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Bar, Pill } from './parts'

const TABS = ['Overview', 'Workflows', 'Tools'] as const

/**
 * `/companies/[handle]` — the back link and tab labels are real; the logo and
 * name (44), the facts row with Website, X and LinkedIn (40), and the
 * Overview panel (description, then two founders) pulse.
 */
export function CompanyDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <Link
        className="type-control w-fit text-subtle transition-colors hover:text-foreground"
        href="/companies"
      >
        ← All companies
      </Link>

      <div aria-hidden="true" className="flex flex-col">
        <div className="mt-8 flex h-11 items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <Bar className="h-8 w-40" />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:h-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5">
            <Pill className="h-6 w-56" />
            <Pill className="h-6 w-12" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-10 w-28 rounded-full border" />
            <Pill className="size-8" />
            <Pill className="size-8" />
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
          <div className="flex gap-1 lg:flex-col lg:gap-0.5">
            {TABS.map((label, index) => (
              <span
                className={
                  index === 0
                    ? 'type-control flex h-9.5 items-center rounded-xl bg-black/5 px-3 text-foreground'
                    : 'type-control flex h-9.5 items-center justify-between rounded-xl px-3 text-subtle'
                }
                key={label}
              >
                {label}
                {index === 0 ? null : <Bar className="ml-3 h-3 w-3" />}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex h-7 items-center">
                <Bar className="h-5 w-28" />
              </div>
              <div className="flex max-w-2xl flex-col">
                <div className="flex h-6 items-center">
                  <Bar className="w-full" />
                </div>
                <div className="flex h-6 items-center">
                  <Bar className="w-2/3" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex h-5 items-center">
                <Bar className="h-3.5 w-28" />
              </div>
              <div className="flex max-w-2xl flex-col gap-2">
                {['a', 'b'].map((id) => (
                  <div className="flex items-center gap-3 py-2" key={id}>
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Bar className="w-28" />
                      <Bar className="h-3 w-36" />
                    </div>
                    <Pill className="size-7" />
                    <Pill className="size-7" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
