'use client'

import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'
import { type ToolCardData, ToolRow } from '@/components/catalog/cards'
import { EntityLogo } from '@/components/common/entity-logo'
import { NoResults } from '@/components/common/no-results'
import { SectionHeading } from '@/components/layout/section-heading'
import { CatalogSearch } from '@/components/search/catalog-search'
import { ListingToolbar } from '@/components/search/listing-toolbar'
import {
  completeChips,
  parseSearchText,
  searchHref,
  searchStateFromParams,
  searchText,
} from '@/lib/catalog/query'
import { searchToolItems, type ToolSearchItem } from '@/lib/catalog/search'
import type { TagChip } from '@/lib/types/catalog'

function withExpandedView(href: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}view=all`
}

function ToolSection({
  title,
  cards,
  moreHref,
  isExpanded = false,
}: {
  title: string
  cards: ReadonlyArray<ToolCardData>
  moreHref: string
  isExpanded?: boolean
}) {
  const visible = isExpanded ? cards : cards.slice(0, 6)
  const hidden = isExpanded ? [] : cards.slice(6)
  const names = hidden.slice(0, 2).map((card) => card.tool.name)
  let moreLabel = `See ${names.join(' and ')}`
  if (names.length === 1) {
    moreLabel = `See ${names[0]}`
  } else if (hidden.length > 2) {
    moreLabel = `See ${names.join(', ')}, and more`
  }

  return (
    <section className="flex flex-col gap-(--space-md)">
      <div className="flex items-baseline gap-3">
        <h2 className="type-category">{title}</h2>
        <span className="type-meta">{cards.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
        {visible.map((card) => (
          <ToolRow key={card.tool.key} {...card} />
        ))}
      </div>
      {hidden.length > 0 ? (
        <Link
          className="focus-ring group/more flex items-center gap-4 rounded-xl py-3 text-subtle transition-colors hover:text-foreground"
          href={moreHref}
        >
          <span className="flex shrink-0 [&>*+*]:-ml-2">
            {hidden.slice(0, 3).map((card) => (
              <EntityLogo
                className="rounded-lg ring-2 ring-background"
                key={card.tool.key}
                logoUrl={card.company.logoUrl}
                name={card.company.name}
                size={28}
              />
            ))}
          </span>
          <span className="type-control min-w-0 flex-1 truncate">
            {moreLabel}
          </span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform group-hover/more:translate-x-1"
            icon={ArrowRight02Icon}
          />
        </Link>
      ) : null}
    </section>
  )
}

type CategoryGroup = {
  category: { slug: string; label: string }
  cards: Array<ToolCardData>
}

function groupByCategory(
  results: ReadonlyArray<ToolCardData>
): Array<CategoryGroup> {
  const groups = new Map<string, CategoryGroup>()
  for (const card of results) {
    if (!card.category) {
      continue
    }
    const existing = groups.get(card.category.slug)
    if (existing) {
      existing.cards.push(card)
    } else {
      groups.set(card.category.slug, { category: card.category, cards: [card] })
    }
  }
  return [...groups.values()].sort((a, b) =>
    a.category.label.localeCompare(b.category.label)
  )
}

type ExplorerProps = {
  tools: ReadonlyArray<ToolSearchItem>
  tags: ReadonlyArray<TagChip>
}

/** No query: what the prerendered page shows before the URL is read. */
const NO_PARAMS = new URLSearchParams()

/**
 * Every tool, prerendered, narrowed by the URL in the browser. The URL is only
 * known at request time, so reading it suspends the prerender — and the
 * fallback is the SAME explorer with no query: the static HTML carries every
 * tool and every link, and a visit with no query swaps in identical markup.
 */
export function ToolsExplorer(props: ExplorerProps) {
  return (
    <Suspense fallback={<ToolsExplorerView {...props} params={NO_PARAMS} />}>
      <ToolsExplorerFromUrl {...props} />
    </Suspense>
  )
}

function ToolsExplorerFromUrl(props: ExplorerProps) {
  return <ToolsExplorerView {...props} params={useSearchParams()} />
}

function ToolsExplorerView({
  tools,
  tags,
  params: searchParams,
}: ExplorerProps & { params: URLSearchParams }) {
  const params = Object.fromEntries(searchParams.entries())

  const fromParams = searchStateFromParams(params)
  const typed = parseSearchText(fromParams.words.join(' '))
  const { chips, unknown } = completeChips(
    [...new Set([...fromParams.chips, ...typed.chips])],
    tags.map((tag) => tag.key)
  )
  const state = { words: typed.words, chips }
  const isBrowsing = state.chips.length === 0 && state.words.length === 0
  const categoryChips = state.chips.filter((chip) =>
    chip.startsWith('category:')
  )
  const searchChips = state.chips.filter(
    (chip) => !chip.startsWith('category:')
  )
  const { results } = searchToolItems(tools, {
    q: state.words.join(' '),
    chips: state.chips,
  })
  const categoryGroups = groupByCategory(results)
  const categoryOptions = tags
    .filter((tag) => tag.namespace === 'category' && tag.counts.companies > 0)
    .map((tag) => ({ key: tag.key, label: tag.label }))
  const isExpanded = params.view === 'all'
  const selectedCategories = tags.filter(
    (tag) => tag.namespace === 'category' && state.chips.includes(tag.key)
  )
  const resultsTitle =
    selectedCategories.length > 0
      ? selectedCategories.map((tag) => tag.label).join(' + ')
      : 'Results'
  const currentHref = searchHref('/tools', state)
  const hasContent = isBrowsing ? categoryGroups.length > 0 : results.length > 0

  let content: ReactNode
  if (!hasContent) {
    content = (
      <NoResults
        clearHref={isBrowsing ? undefined : '/tools'}
        description="Try fewer filters or different words."
        title="No tools found"
      />
    )
  } else if (isBrowsing) {
    content = (
      <div className="flex flex-col gap-(--space-3xl)">
        {categoryGroups.map(({ category, cards }) => (
          <ToolSection
            cards={cards}
            key={category.slug}
            moreHref={withExpandedView(
              searchHref('/tools', {
                words: [],
                chips: [`category:${category.slug}`],
              })
            )}
            title={category.label}
          />
        ))}
      </div>
    )
  } else {
    content = (
      <ToolSection
        cards={results}
        isExpanded={isExpanded}
        moreHref={withExpandedView(currentHref)}
        title={resultsTitle}
      />
    )
  }

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        description="Every tool and the company behind it. Reach it over MCP, CLI or API."
        title="Discover tools"
      />

      <div className="flex flex-col gap-(--space-3xl)">
        <div className="flex flex-col gap-3">
          <ListingToolbar
            groups={[
              {
                key: 'category',
                label: 'Filter tools by category',
                all: {
                  href: searchHref('/tools', {
                    words: state.words,
                    chips: searchChips,
                  }),
                  active: categoryChips.length === 0,
                },
                moreTitle: 'More filters',
                options: categoryOptions.map((category) => ({
                  ...category,
                  href: searchHref('/tools', {
                    words: state.words,
                    chips: [
                      ...searchChips,
                      ...(categoryChips.includes(category.key)
                        ? []
                        : [category.key]),
                    ],
                  }),
                  active: categoryChips.includes(category.key),
                })),
              },
            ]}
            search={
              <CatalogSearch
                action="/tools"
                defaultValue={searchText(state)}
                label="Search tools"
                placeholder="Search tools…"
              />
            }
          />
          {unknown.length > 0 ? (
            <p className="type-body text-workflow">
              No tag matches {unknown.join(', ')}. Pick one above instead.
            </p>
          ) : null}
        </div>

        {content}
      </div>
    </div>
  )
}
