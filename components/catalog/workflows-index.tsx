'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, use } from 'react'
import { CatalogList, workflowListItem } from '@/components/catalog/list'
import { NoResults } from '@/components/common/no-results'
import { SectionHeading } from '@/components/layout/section-heading'
import { CatalogSearch } from '@/components/search/catalog-search'
import type { FilterOption } from '@/components/search/filter-types'
import { ListingToolbar } from '@/components/search/listing-toolbar'
import { isValidTagKey, TAG_NAMESPACES } from '@/lib/catalog/keys'
import {
  type WorkflowSort as Sort,
  searchWorkflowItems,
  type WorkflowSearchItem,
} from '@/lib/catalog/search'
import { useIsClient } from '@/lib/hooks/use-is-client'
import type { TagChip } from '@/lib/types/catalog'
import {
  COPY_ANGLES,
  type CopyAngle,
  type CopyStatsByKey,
} from '@/lib/usage/stats'

const BASE = '/workflows'

/** The copy counts, read at request time; `null` when nothing counts them. */
type StatsPromise = Promise<CopyStatsByKey | null> | null

function parseSort(value: string | null, isCounting: boolean): Sort {
  if (value === 'new') {
    return 'new'
  }
  if (isCounting && (value === 'hot' || value === 'popular')) {
    return value
  }
  return 'featured'
}

function isAngle(sort: Sort): sort is CopyAngle {
  return sort === 'hot' || sort === 'popular'
}

/** `motion:outbound` as the query writes it: `?motion=outbound`. */
function tagParam(tag: string): Record<string, string> {
  const [namespace = '', slug = ''] = tag.split(':')
  return tag ? { [namespace]: slug } : {}
}

/**
 * The one tag the URL filters by, in the grammar every listing uses — or, for
 * links made before it, `?tag=motion:outbound`.
 */
function tagFrom(searchParams: URLSearchParams): string {
  for (const namespace of TAG_NAMESPACES) {
    const slug = (searchParams.get(namespace) ?? '').trim()
    if (slug) {
      return `${namespace}:${slug}`
    }
  }
  const legacy = (searchParams.get('tag') ?? '').trim()
  return isValidTagKey(legacy) ? legacy : ''
}

function href(sort: Sort, q: string, tag?: string): string {
  const params = new URLSearchParams()
  if (sort !== 'featured') {
    params.set('sort', sort)
  }
  for (const [name, value] of Object.entries(tagParam(tag ?? ''))) {
    params.set(name, value)
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
  tag: string,
  isCounting: boolean
): { all: { href: string; active: boolean }; options: Array<FilterOption> } {
  const angles: Array<Sort> = isCounting ? ['hot', 'popular'] : []
  const orders: Array<FilterOption> = [...angles, 'new' as const].map(
    (order) => ({
      key: order,
      label: isAngle(order) ? COPY_ANGLES[order].label : 'New',
      href: href(order, q, tag),
      active: sort === order,
    })
  )
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

type IndexProps = {
  workflows: ReadonlyArray<WorkflowSearchItem>
  tags: ReadonlyArray<TagChip>
  /** Opens the Hot and Popular angles, which order by it. */
  stats: StatsPromise
}

/** No query: what the prerendered page shows before the URL is read. */
const NO_PARAMS = new URLSearchParams()

/**
 * Every workflow, prerendered, narrowed by the URL in the browser: the
 * prerender draws the index with no query (every workflow and link, fully
 * static); once hydrated it reads the URL and follows it.
 */
export function WorkflowsIndex(props: IndexProps) {
  const unread = <WorkflowsIndexView {...props} params={NO_PARAMS} />
  // Hot and Popular order by the counts, which may still be streaming in
  // after a client navigation: until they land, the list in its usual order.
  return useIsClient() ? (
    <Suspense fallback={unread}>
      <WorkflowsIndexFromUrl {...props} />
    </Suspense>
  ) : (
    unread
  )
}

function WorkflowsIndexFromUrl(props: IndexProps) {
  return <WorkflowsIndexView {...props} params={useSearchParams()} />
}

const HEADING: Record<Sort, { title: string; description: string }> = {
  featured: {
    title: 'Discover workflows',
    description:
      'Steps across tools that reach a result. Copy the file; run it with any agent.',
  },
  new: {
    title: 'New workflows',
    description: 'The newest and latest-updated workflows first.',
  },
  hot: {
    title: COPY_ANGLES.hot.title,
    description: 'The workflows copied into agents most over the last 7 days.',
  },
  popular: {
    title: COPY_ANGLES.popular.title,
    description: 'The workflows copied into agents most, all time.',
  },
}

function WorkflowsIndexView({
  workflows,
  tags,
  stats,
  params: searchParams,
}: IndexProps & { params: URLSearchParams }) {
  const isCounting = stats !== null
  const sort = parseSort(searchParams.get('sort'), isCounting)
  const tag = tagFrom(searchParams)
  const q = (searchParams.get('q') ?? '').trim()
  const rows = searchWorkflowItems(workflows, {
    q,
    sort,
    ...(tag ? { tag } : {}),
    // Only an angle needs the counts, to order the list.
    stats: isAngle(sort) && stats ? use(stats) : null,
  })
  const hasFilters = Boolean(q || tag || sort !== 'featured')
  const empty = emptyCopy(q, hasFilters)

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        description={HEADING[sort].description}
        title={q ? `Results for “${q}”` : HEADING[sort].title}
      />

      <div className="flex flex-col gap-1">
        <ListingToolbar
          groups={[
            {
              key: 'view',
              label: 'Filter workflows',
              moreTitle: 'More filters',
              top: isCounting ? 5 : 3,
              ...viewFilters(tags, sort, q, tag, isCounting),
            },
          ]}
          search={
            <CatalogSearch
              action={BASE}
              defaultValue={q}
              label="Search workflows"
              params={{
                sort: sort === 'featured' ? undefined : sort,
                ...tagParam(tag),
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
