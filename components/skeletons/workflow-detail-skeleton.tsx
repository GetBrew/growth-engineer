import { Skeleton } from '@/components/ui/skeleton'
import {
  DetailHeaderSkeleton,
  MarkdownFileSkeleton,
  PanelHeadingSkeleton,
} from './detail-page-skeleton'
import { Bar, Pill } from './parts'

const STEPS = ['step-1', 'step-2', 'step-3'] as const

export function WorkflowDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-(--space-block)">
      <DetailHeaderSkeleton summaryLines={2} tags={6} titleWidth="w-[36rem]" />

      <div className="grid gap-(--space-block) lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="flex min-w-0 flex-col gap-(--space-md)">
          <MarkdownFileSkeleton />
        </section>

        <aside className="flex flex-col gap-(--space-xs)">
          <PanelHeadingSkeleton className="w-28" />
          <ol className="flex flex-col gap-5 rounded-2xl border bg-background p-5">
            {STEPS.map((step) => (
              <li
                className="grid grid-cols-[28px_minmax(0,1fr)] gap-3"
                key={step}
              >
                <Skeleton className="size-7 rounded-full" />
                <div className="flex min-w-0 flex-col gap-2 pt-0.5">
                  <Bar className="h-4 w-32" />
                  <div className="flex items-center gap-1.5">
                    <Pill className="h-6 w-32" />
                    <Pill className="h-5 w-10" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}
