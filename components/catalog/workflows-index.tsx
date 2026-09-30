'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, use } from 'react'
import { CatalogList, workflowListItem } from '@/components/catalog/list'
import { UsageFigures } from '@/components/catalog/usage-figures'
import { NoResults } from '@/components/common/no-results'
import { FilterSearch } from '@/components/search/filter-search'
import { OrderTabs } from '@/components/search/order-tabs'
import {
  type FilterOption,
  workflowFilterOptions,
} from '@/lib/catalog/filter-suggestions'
import { isValidTagKey } from '@/lib/catalog/keys'
import { chipParams, searchStateFromParams } from '@/lib/catalog/query'
import {
  type WorkflowSort as Sort,
  searchWorkflowItems,
  type WorkflowSearchItem,
} from '@/lib/catalog/search'
import { useIsClient } from '@/lib/hooks/use-is-client'
import type { TagChip } from '@/lib/types/catalog'
import { type CopyStatsByKey, statsFor } from '@/lib/usage/stats'

const BASE = '/'

type StatsPromise = Promise<CopyStatsByKey | null> | null

/** New is the default; Popular only when there are copies to count. */
function parseSort(value: string | null, isCounting: boolean): Sort {
  return isCounting && value === 'popular' ? 'popular' : 'new'
}

function chipsFrom(
  searchParams: URLSearchParams,
  tagKeys: ReadonlySet<string>
): Array<string> {
  const legacy = (searchParams.get('tag') ?? '').trim()
  return [
    ...new Set([
      ...searchStateFromParams(Object.fromEntries(searchParams.entries()))
        .chips,
      ...(isValidTagKey(legacy) ? [legacy] : []),
    ]),
  ].filter((chip) => tagKeys.has(chip))
}

type Query = {
  sort: Sort
  q: string
  chips: ReadonlyArray<string>
  company: string
}

function href({ sort, q, chips, company }: Query): string {
  const params = new URLSearchParams()
  if (sort !== 'new') {
    params.set('sort', sort)
  }
  for (const [name, value] of Object.entries(chipParams(chips))) {
    params.set(name, value)
  }
  if (company) {
    params.set('company', company)
  }
  if (q) {
    params.set('q', q)
  }
  const search = params.toString().replaceAll('%2C', ',')
  return search ? `${BASE}?${search}` : BASE
}

function withFilter(query: Query, option: FilterOption, q: string): string {
  const slug = option.key.slice(option.key.indexOf(':') + 1)
  return option.kind === 'company'
    ? href({ ...query, company: slug, q })
    : href({ ...query, chips: [...query.chips, option.key], q })
}

function withoutFilter(query: Query, option: FilterOption): string {
  return option.kind === 'company'
    ? href({ ...query, company: '' })
    : href({
        ...query,
        chips: query.chips.filter((chip) => chip !== option.key),
      })
}

const ORDER_LABEL: Record<Sort, string> = { new: 'New', popular: 'Popular' }

function orderLinks(
  query: Query
): Array<{ value: Sort; label: string; href: string }> {
  return (['new', 'popular'] as const).map((order) => ({
    value: order,
    label: ORDER_LABEL[order],
    href: href({ ...query, sort: order }),
  }))
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
      description: 'No workflows match these filters. Remove one to see more.',
    }
  }
  return {
    title: 'No workflows yet',
    description: 'Add one under workflows/ and open a pull request.',
  }
}

type IndexProps = {
  workflows: ReadonlyArray<WorkflowSearchItem>
  tags: ReadonlyArray<TagChip>
  stats: StatsPromise
}

const NO_PARAMS = new URLSearchParams()

export function WorkflowsIndex(props: IndexProps) {
  const unread = (
    <WorkflowsIndexView {...props} counts={null} params={NO_PARAMS} />
  )

  return useIsClient() ? (
    <Suspense fallback={unread}>
      <WorkflowsIndexFromUrl {...props} />
    </Suspense>
  ) : (
    unread
  )
}

function WorkflowsIndexFromUrl(props: IndexProps) {
  const counts = props.stats ? use(props.stats) : null
  return (
    <WorkflowsIndexView {...props} counts={counts} params={useSearchParams()} />
  )
}

function WorkflowsIndexView({
  workflows,
  tags,
  stats,
  counts,
  params: searchParams,
}: IndexProps & { counts: CopyStatsByKey | null; params: URLSearchParams }) {
  const isCounting = stats !== null
  const options = workflowFilterOptions(workflows, tags)
  const query: Query = {
    sort: parseSort(searchParams.get('sort'), isCounting),
    chips: chipsFrom(searchParams, new Set(tags.map((tag) => tag.key))),
    company: (searchParams.get('company') ?? '').trim(),
    q: (searchParams.get('q') ?? '').trim(),
  }
  const { sort, chips, company, q } = query
  const rows = searchWorkflowItems(workflows, {
    q,
    sort,
    chips,
    ...(company ? { company } : {}),
    stats: sort === 'popular' ? counts : null,
  })
  const hasFilters = Boolean(q || chips.length > 0 || company)
  const empty = emptyCopy(q, hasFilters)
  const active = [...chips, ...(company ? [`company:${company}`] : [])]
    .map((key) => options.find((option) => option.key === key))
    .filter((option): option is FilterOption => option !== undefined)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <FilterSearch
          action={BASE}
          active={active}
          className="min-w-0 flex-1"
          clearHref={href({ ...query, q: '', chips: [], company: '' })}
          defaultValue={q}
          label="Search workflows"
          options={options}
          params={{
            sort: sort === 'new' ? undefined : sort,
            ...chipParams(chips),
            company: company || undefined,
          }}
          pickHref={(option, words) => withFilter(query, option, words)}
          placeholder={`Search ${workflows.length} workflows`}
          removeHref={(option) => withoutFilter(query, option)}
        />
        {isCounting ? (
          <OrderTabs
            label="Order workflows"
            orders={orderLinks(query)}
            value={sort}
          />
        ) : null}
      </div>

      {rows.length === 0 ? (
        <NoResults
          clearHref={hasFilters ? BASE : undefined}
          description={empty.description}
          entity="workflow"
          title={empty.title}
        />
      ) : (
        <CatalogList
          items={rows.map((row) => ({
            ...workflowListItem(row),
            ...(isCounting
              ? {
                  usage: counts ? (
                    <UsageFigures {...statsFor(counts, row.workflow.key)} />
                  ) : null,
                }
              : {}),
          }))}
        />
      )}
    </div>
  )
}
