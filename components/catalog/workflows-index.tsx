'use client'

import { useSearchParams } from 'next/navigation'
import {
  CatalogList,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import { NoResults } from '@/components/catalog/no-results'
import { SectionHeading } from '@/components/layout/primitives'
import { CatalogSearch } from '@/components/search/catalog-search'
import type { FilterOption } from '@/components/search/filter-types'
import { ListingToolbar } from '@/components/search/listing-toolbar'
import {
  searchWorkflowItems,
  type WorkflowSearchItem,
} from '@/lib/catalog/search'
import type { TagChip } from '@/lib/types/catalog'

type Sort = 'featured' | 'new'

const BASE = '/workflows'

function parseSort(value: string | null): Sort {
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
  tags: ReadonlyArray<TagChip>,
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
  const tagOptions: Array<FilterOption> = tags.map((entry) => ({
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

export function WorkflowsIndex({
  workflows,
  tags,
}: {
  workflows: ReadonlyArray<WorkflowSearchItem>

  tags: ReadonlyArray<TagChip>
}) {
  const searchParams = useSearchParams()
  const sort = parseSort(searchParams.get('sort'))
  const tag = (searchParams.get('tag') ?? '').trim()
  const q = (searchParams.get('q') ?? '').trim()
  const rows = searchWorkflowItems(workflows, {
    q,
    sort,
    ...(tag ? { tag } : {}),
  })
  const hasFilters = Boolean(q || tag || sort !== 'featured')
  const empty = emptyCopy(q, hasFilters)

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        description="Steps across tools that reach a result. Copy the file; run it with any agent."
        title={q ? `Results for “${q}”` : 'Discover workflows'}
      />

      <div className="flex flex-col gap-1">
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
            entity="workflow"
            title={empty.title}
          />
        ) : (
          <CatalogList items={rows.map(workflowListItem)} />
        )}
      </div>
    </div>
  )
}
