import { Skeleton } from '@/components/ui/skeleton'
import { Bar, Pill } from './parts'

const TABS = ['Overview', 'Workflows', 'Tools'] as const

export function CompanyDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <Bar className="h-7 w-44" />
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Pill className="size-10" />
            <Pill className="h-10 w-36" />
            <Pill className="h-10 w-28" />
            <div className="flex items-center gap-0.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="mt-[calc(var(--space-block)/2)] border-t border-dashed pt-[calc(var(--space-block)/2)]">
        <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
          <div className="flex gap-1 lg:flex-col lg:gap-0.5">
            {TABS.map((tab) => (
              <div
                className="flex h-9 items-center justify-between rounded-xl px-3 first:bg-hover"
                key={tab}
              >
                <Bar className="h-3.5 w-20" />
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-h-10 items-center">
              <Bar className="h-5 w-28" />
            </div>
            <div className="flex max-w-2xl flex-col gap-2.5">
              <Bar className="w-full" />
              <Bar className="w-11/12" />
              <Bar className="w-2/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
