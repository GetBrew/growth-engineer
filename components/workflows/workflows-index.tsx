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

/**
 * The workflows index. THERE IS ONE KIND OF WORKFLOW: a growth hack is a
 * workflow with one tool, same file, same list — so the only axes here are
 * the sort, a tag and the search text, and every combination is a URL.
 */

type Sort = 'featured' | 'new'
type Tag = { key: string; label: string; counts: { workflows: number } }

const BASE = '/workflows'

export type WorkflowsSearchParams = Promise<{
  sort?: string | Array<string>
  tag?: string | Array<string>
  q?: string | Array<string>
}>

/** `new`, or featured — which is also where the old `top`/`trending` URLs land. */
function parseSort(value: string): Sort {
  return value === 'new' ? 'new' : 'featured'
}

function href(sort: Sort, q: string, tag?: string): string {
  const params = new URLSearchParams()
  if (sort !== 'featured') {
    params.set('sort', sort)
  }
  if (tag) {
    params.set('tag', tag)
  }
  if (q) {
    params.set('q', q)
  }
  const query = params.toString()
  return query ? `${BASE}?${query}` : BASE
}

function viewFilters(
  tags: ReadonlyArray<Tag>,
  sort: Sort,
  q: string,
  tag: string
): { all: { href: string; active: boolean }; options: Array<FilterOption> } {
  const orders: Array<FilterOption> = [
    {
      key: 'new',
      label: 'New',
      href: href('new', q, tag),
      active: sort === 'new',
    },
  ]
  const tagOptions: Array<FilterOption> = tags
    .filter((entry) => entry.counts.workflows > 0)
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      count: entry.counts.workflows,
      href: href(sort, q, entry.key),
      active: tag === entry.key,
    }))
  return {
    all: { href: BASE, active: sort === 'featured' && !q && !tag },
    options: [...orders, ...tagOptions],
  }
}

function workflowRows(q: string, sort: Sort, tag: string) {
  return q
    ? searchWorkflows(q, sort, tag || undefined)
    : loadWorkflows(sort, 30, tag || undefined)
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
    description: 'Add one under workflows/ and open a pull request.',
  }
}

export async function WorkflowsIndex({
  searchParams,
}: {
  searchParams: WorkflowsSearchParams
}) {
  const params = await searchParams
  const sort = parseSort(firstParam(params.sort))
  const tag = firstParam(params.tag).trim()
  const q = firstParam(params.q).trim()

  const [rows, tags] = await Promise.all([
    workflowRows(q, sort, tag),
    loadActiveTags(),
  ])
  const hasFilters = Boolean(q || tag || sort !== 'featured')
  const empty = emptyCopy(q, hasFilters)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        description="Steps across tools that reach a result. Copy the file; run it with any agent."
        title={q ? `Results for “${q}”` : 'Discover workflows'}
      />

      <ListingToolbar
        groups={[
          {
            key: 'view',
            label: 'Filter workflows',
            moreTitle: 'More filters',
            top: 3,
            ...viewFilters(tags, sort, q, tag),
          },
        ]}
        search={
          <CatalogSearch
            action={BASE}
            defaultValue={q}
            label="Search workflows"
            params={{
              sort: sort === 'featured' ? undefined : sort,
              tag: tag || undefined,
            }}
            placeholder="Search workflows…"
          />
        }
      />

      {rows.length === 0 ? (
        <NoResults
          clearHref={hasFilters ? BASE : undefined}
          description={empty.description}
          icon={<MaskIcon size={20} src="/workflow.svg" />}
          title={empty.title}
        />
      ) : (
        <div className="flex flex-col border-t">
          {rows.map((row) => (
            <WorkflowRow key={row.workflow.key} {...row} />
          ))}
        </div>
      )}
    </div>
  )
}
