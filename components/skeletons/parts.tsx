import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

/**
 * The pieces every route skeleton is built from. Each one is the box of the
 * thing it stands in for (same height, padding and gaps), so a page lands
 * without moving. Bars are text; pills are pills.
 */

/** A line of text. */
export function Bar({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3.5 rounded', className)} />
}

/** A pill, a badge or a round avatar. */
export function Pill({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />
}

/** Varied widths, so rows read as text rather than a grid of bars. */
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

/** SectionHeading: a 32px title and one line of intro. */
export function HeadingSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex h-8 items-center">
        <Bar className="h-6 w-40" />
      </div>
      <div className="mt-1.5 flex h-6 items-center">
        <Bar className="w-80 max-w-full" />
      </div>
    </div>
  )
}

/** A listing's filter pills and its search, on one row from `lg`. */
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

/** CatalogList: 86px rows — logo, title with a pill, one line, arrow. */
export function CatalogListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="flex w-full flex-col border-t">
      {rows(count).map((row) => (
        <li className="flex items-center gap-4 border-b py-5" key={row.id}>
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* The 15px title's line box (15 × 20/14). */}
            <div className="flex h-[calc(15px*20/14)] items-center gap-2">
              <Bar className={cn('h-4 max-w-full', row.title)} />
              <Pill className="h-5 w-12 shrink-0" />
            </div>
            <div className="flex h-5 items-center">
              <Bar className={cn('max-w-full', row.line)} />
            </div>
          </div>
          <span className="size-7 shrink-0 rounded-full border" />
        </li>
      ))}
    </ul>
  )
}

/** CategorySection groups: a title with a count, then two columns of rows. */
export function CategoryRowsSkeleton({
  sections = [4, 2, 2],
}: {
  /** Rows per section. */
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
                <span className="size-7 shrink-0 rounded-full border" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** WorkflowRow: 105px rows — three logos, a title with pills, a summary. */
export function WorkflowRowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col border-t">
      {rows(count).map((row) => (
        <div
          className="flex h-[105px] items-center gap-5 border-b sm:gap-6"
          key={row.id}
        >
          <div className="hidden w-[108px] shrink-0 sm:flex sm:[&>*+*]:-ml-4">
            <Pill className="size-11 ring-2 ring-background" />
            <Pill className="size-11 ring-2 ring-background" />
            <Pill className="size-11 ring-2 ring-background" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-2">
              <Bar className={cn('h-5 max-w-full', row.title)} />
              <Pill className="h-5 w-14 shrink-0" />
            </div>
            <Bar className={cn('max-w-full', row.line)} />
          </div>
          <Bar className="size-5 shrink-0" />
        </div>
      ))}
    </div>
  )
}
