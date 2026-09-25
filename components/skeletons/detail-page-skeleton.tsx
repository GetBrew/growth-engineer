import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { Bar, Pill } from './parts'

export function DetailHeaderSkeleton({
  summaryLines = 1,
  titleWidth = 'w-72',
  tags = 3,
}: {
  summaryLines?: 1 | 2
  titleWidth?: string
  tags?: number
}) {
  return (
    <div className="flex flex-col">
      <header>
        <div className="flex h-9 items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Bar className="h-4 w-44" />
        </div>

        <div className="mt-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-8">
          <div className="flex h-[35px] max-w-3xl items-center sm:col-start-1 sm:row-start-1">
            <Bar className={cn('h-7 max-w-full', titleWidth)} />
          </div>

          <div className="mt-2.5 flex max-w-3xl flex-col gap-2 sm:col-start-1 sm:row-start-2">
            <Bar className="h-4 w-11/12" />
            {summaryLines === 2 ? <Bar className="h-4 w-2/5" /> : null}
          </div>

          <div className="mt-6 flex shrink-0 items-center gap-2 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0">
            <Pill className="size-10" />
            <Pill className="h-10 w-36" />
            <Pill className="h-10 w-44" />
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: tags }, (_, index) => (
            <Pill
              className={cn('h-6', TAG_WIDTHS[index % TAG_WIDTHS.length])}
              key={`tag-${index.toString()}`}
            />
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <Bar className="mr-1 h-3 w-36" />
          <Pill className="h-6 w-12" />
          <Pill className="h-6 w-11" />
        </div>
      </div>
    </div>
  )
}

const TAG_WIDTHS = ['w-24', 'w-16', 'w-20', 'w-32', 'w-24', 'w-20'] as const

export function PanelHeadingSkeleton({ className }: { className?: string }) {
  return (
    <div className="flex min-h-10 items-center">
      <Bar className={cn('h-5 w-40', className)} />
    </div>
  )
}

export function MarkdownFileSkeleton({ lines = 12 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <PanelHeadingSkeleton className="w-56" />
          <Pill className="h-9 w-44 shrink-0" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill className="h-10 w-24" />
          <Pill className="h-10 w-32" />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-background px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        {FILE_LINES.slice(0, lines).map((line) => (
          <Skeleton className={`h-3.5 rounded ${line.width}`} key={line.id} />
        ))}
      </div>
    </div>
  )
}

const FILE_LINES = [
  'w-1/2',
  'w-11/12',
  'w-4/5',
  'w-2/3',
  'w-1/3',
  'w-5/6',
  'w-3/4',
  'w-2/5',
  'w-11/12',
  'w-3/5',
  'w-4/5',
  'w-1/2',
  'w-2/3',
  'w-3/4',
].map((width, index) => ({ id: `line-${index.toString()}`, width }))
