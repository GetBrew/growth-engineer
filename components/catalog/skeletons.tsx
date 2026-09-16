/**
 * Suspense fallbacks. Dimensionally stable on purpose — the same box as the
 * content they stand in for — so a page lands and does not jump.
 */

/** Stable ids for placeholder rows. */
function placeholders(count: number): Array<{ id: string; width: number }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder-${index}`,
    width: 45 + ((index * 37) % 50),
  }))
}

export function WorkflowRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col border-border border-t">
      {placeholders(rows).map(({ id }) => (
        <div
          className="flex min-h-[120px] gap-5 border-border border-b py-5 sm:py-6"
          key={id}
        >
          <div className="hidden shrink-0 gap-1 sm:flex">
            <div className="size-11 animate-pulse rounded-full bg-muted" />
            <div className="size-11 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ToolCardsSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {placeholders(cards).map(({ id }) => (
        <div
          className="flex h-[148px] gap-4 rounded-2xl border border-border p-4"
          key={id}
        >
          <div className="size-11 animate-pulse rounded-xl bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CompanyRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
      {placeholders(rows).map(({ id }) => (
        <div className="-mx-3 flex items-center gap-4 px-3 py-3" key={id}>
          <div className="size-11 animate-pulse rounded-xl bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DocumentSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border"
    >
      <div className="flex items-center justify-between border-border border-b px-4 py-3">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex h-[480px] flex-col gap-3 px-5 py-4">
        {placeholders(14).map(({ id, width }) => (
          <div
            className="h-3 animate-pulse rounded bg-muted"
            key={id}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="size-11 animate-pulse rounded-xl bg-muted" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-6 w-56 animate-pulse rounded-full bg-muted" />
    </div>
  )
}
