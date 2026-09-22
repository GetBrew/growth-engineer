'use client'

import { ArrowRight02Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { type ToolCardData, ToolRow } from '@/components/catalog/cards'
import { CatalogSearch } from '@/components/catalog/catalog-search'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { ListingToolbar } from '@/components/catalog/listing-toolbar'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  completeChips,
  parseSearchText,
  searchHref,
  searchStateFromParams,
  searchText,
} from '@/lib/catalog/query'
import { searchToolItems, type ToolSearchItem } from '@/lib/catalog/search'
import type { TagChip } from '@/lib/catalog/types'

/**
 * The tools listing, filtered in the browser. The page prerenders every
 * published tool once; this component reads the URL (`?q=…&has=mcp`) and
 * narrows the list with the same grammar and the same search the build
 * tests, so every permutation is instant and the page stays static. The URL
 * is still the state — an agent can use the same URL.
 */

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
    <section className="flex flex-col gap-5">
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

export function ToolsExplorer({
  tools,
  tags,
}: {
  tools: ReadonlyArray<ToolSearchItem>
  tags: ReadonlyArray<TagChip>
}) {
  const searchParams = useSearchParams()
  const params = Object.fromEntries(searchParams.entries())
  // `q` may carry chips typed inline; lift them into the chip set.
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
      <Empty className="border-y py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              aria-hidden="true"
              icon={Search01Icon}
              strokeWidth={1.8}
            />
          </EmptyMedia>
          <EmptyTitle>No tools found</EmptyTitle>
          <EmptyDescription>
            Try fewer filters or different words.
          </EmptyDescription>
        </EmptyHeader>
        {isBrowsing ? null : (
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/tools"
          >
            Clear filters
          </Link>
        )}
      </Empty>
    )
  } else if (isBrowsing) {
    content = (
      <div className="flex flex-col gap-12">
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <ListingToolbar
          groups={[
            {
              key: 'category',
              label: 'Filter tools by category',
              all: {
                href: searchHref('/tools', { words: [], chips: searchChips }),
                active: categoryChips.length === 0,
              },
              moreTitle: 'More filters',
              options: categoryOptions.map((category) => ({
                ...category,
                href: searchHref('/tools', {
                  words: [],
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
  )
}
