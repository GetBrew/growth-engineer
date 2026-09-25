import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

export function Bar({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3.5 rounded', className)} />
}

export function Pill({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />
}

const TITLE_WIDTHS = ['w-72', 'w-56', 'w-64', 'w-52', 'w-60', 'w-48'] as const
const LINE_WIDTHS = [
  'w-3/4',
  'w-2/3',
  'w-4/5',
  'w-3/5',
  'w-2/3',
  'w-1/2',
] as const

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    title: TITLE_WIDTHS[index % TITLE_WIDTHS.length],
    line: LINE_WIDTHS[index % LINE_WIDTHS.length],
  }))
}

export function HeadingSkeleton({
  titleWidth = 'w-56',
}: {
  titleWidth?: string
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-[34.5px] items-center">
        <Bar className={cn('h-7', titleWidth)} />
      </div>
      <div className="mt-2 flex h-6 items-center">
        <Bar className="h-4 w-96 max-w-full" />
      </div>
    </div>
  )
}

export function ToolbarSkeleton({
  pills = 4,
  searchClassName = 'lg:w-72',
}: {
  pills?: number
  searchClassName?: string
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: pills }, (_, index) => (
          <Pill
            className={cn('h-10', index === 0 ? 'w-12' : 'w-24')}
            key={`pill-${index.toString()}`}
          />
        ))}
      </div>
      <Pill className={cn('h-10 w-full lg:shrink-0', searchClassName)} />
    </div>
  )
}

export function CatalogListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="flex w-full flex-col">
      {rows(count).map((row) => (
        <li
          className="flex items-center gap-4 border-b py-4 last:border-b-0"
          key={row.id}
        >
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex h-[25.5px] items-center gap-2">
              <Bar className={cn('h-4 max-w-full', row.title)} />
              <Pill className="h-5 w-12 shrink-0" />
            </div>
            <div className="flex h-12 items-center sm:h-6">
              <Bar className={cn('max-w-full', row.line)} />
            </div>
          </div>
          <span className="hidden size-7 shrink-0 sm:block" />
        </li>
      ))}
    </ul>
  )
}

export function CategoryRowsSkeleton({
  sections = [4, 2, 2],
}: {
  sections?: ReadonlyArray<number>
}) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((count, index) => (
        <section
          className="flex flex-col gap-5"
          key={`section-${index.toString()}`}
        >
          <div className="flex h-7 items-center gap-3">
            <Bar className="h-5 w-28" />
            <Bar className="h-3 w-4" />
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
            {rows(count).map((row) => (
              <div
                className="-mx-3 flex h-[68px] items-center gap-4 px-3"
                key={row.id}
              >
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Bar className="h-4 w-32" />
                    <Pill className="h-5 w-10" />
                  </div>
                  <Bar className={cn('max-w-full', row.line)} />
                </div>
                <span className="size-7 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
