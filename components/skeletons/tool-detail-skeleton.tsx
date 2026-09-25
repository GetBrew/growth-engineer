import {
  DetailHeaderSkeleton,
  MarkdownFileSkeleton,
  PanelHeadingSkeleton,
} from './detail-page-skeleton'
import { Bar, CatalogListSkeleton } from './parts'

export function ToolDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-(--space-block)">
      <DetailHeaderSkeleton tags={3} titleWidth="w-80" />

      <div className="flex min-w-0 flex-col gap-(--space-block)">
        <section className="flex flex-col gap-(--space-md)">
          <PanelHeadingSkeleton className="w-32" />
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-5 sm:p-6">
            <Bar className="w-full" />
            <Bar className="w-11/12" />
            <Bar className="w-2/5" />
          </div>
        </section>

        <section className="flex flex-col gap-(--space-md)">
          <MarkdownFileSkeleton />
        </section>

        <section className="flex flex-col gap-(--space-md)">
          <PanelHeadingSkeleton className="w-24" />
          <div className="flex flex-col gap-2 rounded-2xl border bg-surface p-3 sm:p-4">
            <div className="flex h-10 items-center justify-between">
              <Bar className="ml-2 h-4 w-40" />
              <Bar className="mr-2 h-3 w-20" />
            </div>
            <div className="flex h-11 items-center rounded-xl border bg-background px-4">
              <Bar className="h-3 w-3/5" />
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-(--space-md)">
        <PanelHeadingSkeleton className="w-56" />
        <CatalogListSkeleton count={2} />
      </section>
    </div>
  )
}
