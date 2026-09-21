import { connection } from 'next/server'
import { CatalogSearch } from '@/components/catalog/catalog-search'
import { ListingToolbar } from '@/components/catalog/listing-toolbar'
import { NoResults } from '@/components/catalog/no-results'
import { SectionHeading } from '@/components/catalog/primitives'
import type { FilterOption } from '@/components/filters/types'
import { MaskIcon } from '@/components/site/mask-icon'
import {
  loadActiveTags,
  loadWorkflows,
  searchWorkflows,
} from '@/lib/catalog/loaders'
import { firstParam } from '@/lib/catalog/query'
import { WorkflowRow } from './workflow-row'

type Sort = 'trending' | 'top' | 'new'
type Format = 'hack' | 'workflow'
type Tag = { key: string; label: string; counts: { workflows: number } }

export type WorkflowsSearchParams = Promise<{
  sort?: string | Array<string>
  format?: string | Array<string>
  tag?: string | Array<string>
  q?: string | Array<string>
}>

function parseSort(value: string): Sort {
  return value === 'top' || value === 'new' ? value : 'trending'
}

function href(
  base: string,
  sort: Sort,
  format: Format | undefined,
  q: string,
  tag?: string
): string {
  const params = new URLSearchParams()
  if (sort !== 'trending') {
    params.set('sort', sort)
  }
  if (format && base === '/workflows') {
    params.set('format', format)
  }
  if (tag) {
    params.set('tag', tag)
  }
  if (q) {
    params.set('q', q)
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

function viewFilters(
  base: '/workflows' | '/hacks',
  tags: ReadonlyArray<Tag>,
  sort: Sort,
  format: Format | undefined,
  q: string,
  tag: string
): { all: { href: string; active: boolean }; options: Array<FilterOption> } {
  const orders: Array<FilterOption> = (['top', 'new'] as const).map(
    (value) => ({
      key: value,
      label: value === 'top' ? 'Top' : 'New',
      href: href(base, value, format, q, tag),
      active: sort === value,
    })
  )

  const hacks: FilterOption = {
    key: 'hack',
    label: 'Growth hacks',
    href: href(base, sort, 'hack', q, tag),
    active: format === 'hack',
  }
  const tagOptions: Array<FilterOption> = tags
    .filter((entry) => entry.counts.workflows > 0)
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      count: entry.counts.workflows,
      href: href(base, sort, format, q, entry.key),
      active: tag === entry.key,
    }))
  return {
    all: {
      href: base,
      active:
        sort === 'trending' &&
        !q &&
        !tag &&
        (base === '/hacks' || format === undefined),
    },
    options: [
      ...orders,
      ...(base === '/workflows' ? [hacks] : []),
      ...tagOptions,
    ],
  }
}

function workflowRows(
  q: string,
  sort: Sort,
  format: Format | undefined,
  tag: string
) {
  return q
    ? searchWorkflows(q, sort, format, tag || undefined)
    : loadWorkflows(sort, format, 30, tag || undefined)
}

function heading(fixedFormat: Format | undefined, q: string): string {
  if (fixedFormat === 'hack') {
    return 'Discover growth hacks'
  }
  return q ? `Results for “${q}”` : 'Discover workflows'
}

function emptyCopy(
  q: string,
  hasFilters: boolean
): { title: string; description: string } {
  if (q) {
    return {
      title: 'No workflows match',
      description: `Nothing matches “${q}”. Try fewer words, or browse all workflows.`,
    }
  }
  if (hasFilters) {
    return {
      title: 'No workflows match',
      description: 'No workflows match these filters. Try another combination.',
    }
  }
  return {
    title: 'No workflows yet',
    description: 'Run the seed, or publish the first one.',
  }
}

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
  const sort = parseSort(firstParam(params.sort))
  const format =
    fixedFormat ?? (firstParam(params.format) === 'hack' ? 'hack' : undefined)
  const tag = firstParam(params.tag).trim()
  const q = firstParam(params.q).trim()

  await connection()
  const [rows, tags] = await Promise.all([
    workflowRows(q, sort, format, tag),
    loadActiveTags(),
  ])
  const hasFilters = Boolean(
    q || tag || (!fixedFormat && format) || sort !== 'trending'
  )
  const empty = emptyCopy(q, hasFilters)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        description={
          fixedFormat === 'hack'
            ? 'A growth hack is a workflow with one tool: the same file, one setup.'
            : 'Steps across tools that reach a result. Copy the file; run it with any agent.'
        }
        title={heading(fixedFormat, q)}
      />

      <ListingToolbar
        groups={[
          {
            key: 'view',
            label: 'Filter workflows',
            moreTitle: 'More filters',
            top: 3,
            ...viewFilters(base, tags, sort, format, q, tag),
          },
        ]}
        search={
          <CatalogSearch
            action={base}
            defaultValue={q}
            label="Search workflows"
            params={{
              sort: sort === 'trending' ? undefined : sort,
              format: format && !fixedFormat ? format : undefined,
              tag: tag || undefined,
            }}
            placeholder="Search workflows…"
          />
        }
      />

      {rows.length === 0 ? (
        <NoResults
          clearHref={hasFilters ? base : undefined}
          description={empty.description}
          icon={<MaskIcon size={20} src="/workflow.svg" />}
          title={empty.title}
        />
      ) : (
        <div className="flex flex-col border-t">
          {rows.map((row) => (
            <WorkflowRow key={row.workflow._id} {...row} />
          ))}
        </div>
      )}
    </div>
  )
}
