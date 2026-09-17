import { Search } from 'lucide-react'
import { connection } from 'next/server'
import { loadWorkflows, searchWorkflows } from '@/lib/catalog/loaders'
import { WorkflowRow } from './cards'
import { EmptyState, PillLink, SectionHeading } from './primitives'

type Sort = 'trending' | 'top' | 'new'
type Format = 'hack' | 'workflow'

export type WorkflowsSearchParams = Promise<{
  sort?: string | Array<string>
  format?: string | Array<string>
  q?: string | Array<string>
}>

function first(value: string | Array<string> | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

function parseSort(value: string): Sort {
  return value === 'top' || value === 'new' ? value : 'trending'
}

function href(
  base: string,
  sort: Sort,
  format: Format | undefined,
  q: string
): string {
  const params = new URLSearchParams()
  if (sort !== 'trending') {
    params.set('sort', sort)
  }
  if (format && base === '/workflows') {
    params.set('format', format)
  }
  if (q) {
    params.set('q', q)
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

/**
 * The workflows list and its controls, shared by /workflows and /hacks. One
 * async Server Component: it reads the URL (request-time), so it lives inside
 * the page's Suspense boundary, and every control is a link — the URL is the
 * state, and an agent can use the same URL.
 */
export async function WorkflowsIndex({
  base,
  fixedFormat,
  searchParams,
}: {
  base: '/workflows' | '/hacks'
  fixedFormat?: Format
  searchParams: WorkflowsSearchParams
}) {
  const params = await searchParams
  const sort = parseSort(first(params.sort))
  const format =
    fixedFormat ?? (first(params.format) === 'hack' ? 'hack' : undefined)
  const q = first(params.q).trim()

  if (!q) {
    await connection()
  }
  const rows = q
    ? await searchWorkflows(q, format)
    : await loadWorkflows(sort, format, 30)

  let title = 'Workflows'
  if (fixedFormat === 'hack') {
    title = 'Growth hacks'
  } else if (q) {
    title = `Results for “${q}”`
  }

  const sorts: Array<{ value: Sort; label: string }> = [
    { value: 'trending', label: 'Trending' },
    { value: 'top', label: 'Top' },
    { value: 'new', label: 'New' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        description={
          fixedFormat === 'hack'
            ? 'A growth hack is a workflow with one tool: the same file, one setup.'
            : 'Steps across tools that reach a result. Copy the file; run it with any agent.'
        }
        title={title}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {sorts.map((entry) => (
            <PillLink
              active={!q && sort === entry.value}
              href={href(base, entry.value, format, '')}
              key={entry.value}
            >
              {entry.label}
            </PillLink>
          ))}
          {fixedFormat ? null : (
            <PillLink
              active={format === 'hack'}
              href={href(base, sort, format === 'hack' ? undefined : 'hack', q)}
            >
              Hacks only
            </PillLink>
          )}
        </div>
        <form
          action={base}
          className="relative block w-full lg:w-72"
          method="get"
        >
          {sort === 'trending' ? null : (
            <input name="sort" type="hidden" value={sort} />
          )}
          {format && !fixedFormat ? (
            <input name="format" type="hidden" value={format} />
          ) : null}
          <span className="sr-only">Search workflows</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/55"
          />
          <input
            className="focus-ring h-10 w-full rounded-full border border-border bg-white pr-4 pl-10 text-sm placeholder:text-foreground/55"
            defaultValue={q}
            name="q"
            placeholder="Search workflows…"
            type="search"
          />
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          hint={
            q
              ? 'Try fewer words, or browse Trending.'
              : 'Run the seed, or publish the first one.'
          }
          title={q ? 'No workflows match' : 'No workflows yet'}
        />
      ) : (
        <div className="flex flex-col border-border border-t">
          {rows.map((row) => (
            <WorkflowRow key={row.workflow._id} {...row} />
          ))}
        </div>
      )}
    </div>
  )
}
