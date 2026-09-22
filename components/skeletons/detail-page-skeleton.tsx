import { Skeleton } from '@/components/ui/skeleton'
import { Bar, Pill } from './parts'

/**
 * A workflow or tool page while it loads — the same boxes as DetailHeader
 * and the two-column body: byline (36), title (37), the summary (28 a line),
 * stats and logos (28), the two buttons; the tags row (66); then Description
 * and the file on the left, the side panel on the right.
 */
export function DetailPageSkeleton({
  summaryLines = 1,
}: {
  summaryLines?: 1 | 2
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      <div className="flex flex-col">
        <div className="border-b pb-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-1 flex-col">
              <div className="flex h-9 items-center gap-3">
                <Pill className="size-9" />
                <Bar className="w-36" />
              </div>
              <div className="mt-5 flex h-9.25 items-center">
                <Bar className="h-8 w-104 max-w-full" />
              </div>
              <div className="mt-4 flex flex-col">
                <div className="flex h-7 items-center">
                  <Bar className="h-4 w-120 max-w-full" />
                </div>
                {summaryLines === 2 ? (
                  <div className="flex h-7 items-center">
                    <Bar className="h-4 w-48" />
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex h-7 items-center gap-2">
                <Pill className="h-7 w-20" />
                <Pill className="h-7 w-20" />
                <Pill className="h-7 w-24" />
                <Pill className="ml-1 h-7 w-28" />
              </div>
            </div>
            <div className="flex gap-2">
              <span className="h-10 w-24 rounded-full border" />
              <span className="h-10 w-40 rounded-full border" />
            </div>
          </div>
        </div>
        <div className="flex h-16.5 items-center justify-between gap-4 border-b">
          <div className="flex gap-1.5">
            <Pill className="h-6 w-16" />
            <Pill className="h-6 w-14" />
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <Bar className="mr-2 h-2.5 w-32" />
            <Pill className="h-6 w-10" />
            <Pill className="h-6 w-10" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex h-7 items-center">
              <Bar className="h-5 w-32" />
            </div>
            <div className="flex h-39.5 flex-col gap-3 rounded-2xl border bg-surface p-5 sm:p-6">
              <Bar className="w-full" />
              <Bar className="w-11/12" />
              <Bar className="w-1/3" />
              <Bar className="mt-auto w-20" />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex h-7 items-center">
              <Bar className="h-5 w-56" />
            </div>
            <div className="flex h-157 flex-col gap-4 rounded-3xl border bg-surface p-4">
              <div className="flex h-10 items-center justify-between">
                <Bar className="ml-2 h-4 w-44" />
                <div className="flex gap-2">
                  <span className="h-10 w-36 rounded-full border bg-background" />
                  <span className="hidden h-10 w-32 rounded-full border bg-background sm:block" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-2xl border bg-background p-6">
                {FILE_LINES.map((line) => (
                  <Skeleton
                    className={`h-3 rounded ${line.width}`}
                    key={line.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex h-7 items-center">
            <Bar className="h-5 w-28" />
          </div>
          <div className="h-92 rounded-2xl border" />
        </div>
      </div>
    </div>
  )
}

/** The file's text: ragged lines, like prose. */
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
].map((width, index) => ({ id: `line-${index.toString()}`, width }))
