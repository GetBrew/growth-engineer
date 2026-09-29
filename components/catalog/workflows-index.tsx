'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, use } from 'react'
import { CatalogList, workflowListItem } from '@/components/catalog/list'
import { NoResults } from '@/components/common/no-results'
import { SectionHeading } from '@/components/layout/section-heading'
import { CatalogSearch } from '@/components/search/catalog-search'
import type { FilterOption } from '@/components/search/filter-types'
import { ListingToolbar } from '@/components/search/listing-toolbar'
import { MoreFilters } from '@/components/search/more-filters'
import { OrderMenu } from '@/components/search/order-menu'
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

/** What the URL says: an order, one tag, one company whose tools it uses, words. */
type Query = { sort: Sort; q: string; tag: string; company: string }

function href({ sort, q, tag, company }: Query): string {
  const params = new URLSearchParams()
  if (sort !== 'featured') {
    params.set('sort', sort)
  }
  for (const [name, value] of Object.entries(tagParam(tag))) {
    params.set(name, value)
  }
  if (company) {
    params.set('company', company)
  }
  if (q) {
    params.set('q', q)
  }
  const search = params.toString()
  return search ? `${BASE}?${search}` : BASE
}

/** The orders, for the dropdown beside the search box; each keeps the rest of the query. */
function orderLinks(
  query: Query,
  isCounting: boolean
): Array<{ value: Sort; label: string; href: string }> {
  const orders: Array<Sort> = isCounting
    ? ['featured', 'hot', 'popular', 'new']
    : ['featured', 'new']
  return orders.map((order) => ({
    value: order,
    label: ORDER_LABEL[order],
    href: href({ ...query, sort: order }),
  }))
}

const ORDER_LABEL: Record<Sort, string> = {
  featured: 'Featured',
  hot: COPY_ANGLES.hot.label,
  popular: COPY_ANGLES.popular.label,
  new: 'New',
}

/** Whether a workflow uses one of a company's tools; no company is every workflow. */
function usesCompany(item: WorkflowSearchItem, company: string): boolean {
  return !company || item.tools.some((tool) => tool.companyKey === company)
}

/**
 * The motions, as pills; "All" clears the tag and keeps the rest of the
 * query. The counts follow the company picked, so a pill never promises rows
 * the list won't show.
 */
function tagFilters(
  tags: ReadonlyArray<TagChip>,
  workflows: ReadonlyArray<WorkflowSearchItem>,
  query: Query
): { all: { href: string; active: boolean }; options: Array<FilterOption> } {
  const pool = workflows.filter((item) => usesCompany(item, query.company))
  return {
    all: { href: href({ ...query, tag: '' }), active: !query.tag },
    options: tags.map((entry) => {
      const count = pool.filter((item) => item.tags.includes(entry.key)).length
      const active = query.tag === entry.key
      return {
        key: entry.key,
        label: entry.label,
        count,
        href: href({ ...query, tag: entry.key }),
        active,
        disabled: count === 0 && !active,
      }
    }),
  }
}

/**
 * "Works with": the companies whose tools the listed motion's workflows use,
 * with how many use each. Picking one narrows the list; picking it again
 * clears it, so the one picked stays even when the motion leaves it none.
 */
function companyFilters(
  workflows: ReadonlyArray<WorkflowSearchItem>,
  query: Query
): Array<FilterOption> {
  const companies = new Map<string, { name: string; count: number }>()
  for (const item of workflows) {
    const inMotion = !query.tag || item.tags.includes(query.tag)
    for (const tool of new Map(
      item.tools.map((entry) => [entry.companyKey, entry])
    ).values()) {
      const entry = companies.get(tool.companyKey)
      const count = (entry?.count ?? 0) + (inMotion ? 1 : 0)
      companies.set(tool.companyKey, { name: tool.companyName, count })
    }
  }
  return [...companies]
    .filter(([key, { count }]) => count > 0 || key === query.company)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([key, { name, count }]) => ({
      key,
      label: name,
      count,
      href: href({ ...query, company: query.company === key ? '' : key }),
      active: query.company === key,
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
    description: 'Step-by-step growth plays your agent can run.',
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
  const query: Query = {
    sort: parseSort(searchParams.get('sort'), isCounting),
    tag: tagFrom(searchParams),
    company: (searchParams.get('company') ?? '').trim(),
    q: (searchParams.get('q') ?? '').trim(),
  }
  const { sort, tag, company, q } = query
  const rows = searchWorkflowItems(workflows, {
    q,
    sort,
    ...(tag ? { tag } : {}),
    ...(company ? { company } : {}),
    // Only an angle needs the counts, to order the list.
    stats: isAngle(sort) && stats ? use(stats) : null,
  })
  const hasFilters = Boolean(q || tag || company || sort !== 'featured')
  const empty = emptyCopy(q, hasFilters)
  // Words name the list first, then a motion's pill: "Outbound workflows".
  const motion = tags.find((entry) => entry.key === tag)
  let title = HEADING[sort].title
  if (q) {
    title = `Results for “${q}”`
  } else if (motion) {
    title = `${motion.label} workflows`
  }
  // An empty search is dropped from the links, or every one opens nothing.
  const linkQuery = { ...query, q: rows.length > 0 ? q : '' }

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        as="h1"
        description={HEADING[sort].description}
        title={title}
      />

      <div className="flex flex-col gap-1">
        <ListingToolbar
          isStacked
          groups={[
            {
              key: 'motion',
              label: 'Filter workflows by motion',
              // Every motion shows: a handful of labels, never a "More".
              top: tags.length,
              ...tagFilters(tags, workflows, linkQuery),
            },
          ]}
          order={
            <>
              <MoreFilters
                label="Works with"
                options={companyFilters(workflows, linkQuery)}
                title="Works with"
              />
              <OrderMenu orders={orderLinks(query, isCounting)} value={sort} />
            </>
          }
          search={
            <CatalogSearch
              action={BASE}
              defaultValue={q}
              label="Search workflows"
              params={{
                sort: sort === 'featured' ? undefined : sort,
                ...tagParam(tag),
                company: company || undefined,
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
