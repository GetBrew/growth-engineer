'use client'

import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { type ToolCardData, ToolRow } from '@/components/catalog/cards'
import {
  type CategoryEntry,
  CategorySection,
  withExpandedView,
} from '@/components/catalog/category-section'
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
import { useIsClient } from '@/lib/hooks/use-is-client'
import type { TagChip } from '@/lib/types/catalog'

/** A tool's row, named in "See …" by the tool and shown by its company's logo. */
function toolEntries(cards: ReadonlyArray<ToolCardData>): Array<CategoryEntry> {
  return cards.map((card) => ({
    key: card.tool.key,
    name: card.tool.name,
    logo: { name: card.company.name, logoUrl: card.company.logoUrl },
    row: <ToolRow {...card} />,
  }))
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
 * Every tool, prerendered, narrowed by the URL in the browser. The query is
 * only known in the browser, so the prerender draws the explorer with no
 * query — every tool and every link, fully static — and once hydrated it
 * reads the URL and stays in step with it on every navigation.
 */
export function ToolsExplorer(props: ExplorerProps) {
  return useIsClient() ? (
    <ToolsExplorerFromUrl {...props} />
  ) : (
    <ToolsExplorerView {...props} params={NO_PARAMS} />
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
  // Counted like /companies' pills, so FilterPills shows the busiest few and
  // puts the rest under More: an option with no count is always shown, which
  // laid every category out as a wall of pills.
  const toolsPerCategory = new Map(
    groupByCategory(tools).map((group) => [
      group.category.slug,
      group.cards.length,
    ])
  )
  const categoryOptions = tags
    .filter((tag) => tag.namespace === 'category')
    .map((tag) => ({
      key: tag.key,
      label: tag.label,
      count: toolsPerCategory.get(tag.slug) ?? 0,
    }))
    .filter((option) => option.count > 0)
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
          <CategorySection
            entries={toolEntries(cards)}
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
      <CategorySection
        entries={toolEntries(results)}
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
                // A trailing space when chips are shown, so a word typed after
                // `category:crm` starts a new token instead of joining it.
                defaultValue={
                  state.chips.length > 0
                    ? `${searchText(state)} `
                    : searchText(state)
                }
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
