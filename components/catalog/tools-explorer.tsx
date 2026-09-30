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
import { FilterSearch } from '@/components/search/filter-search'
import {
  type FilterOption,
  tagFilterOptions,
} from '@/lib/catalog/filter-suggestions'
import {
  chipParams,
  completeChips,
  parseSearchText,
  searchHref,
  searchStateFromParams,
} from '@/lib/catalog/query'
import { searchToolItems, type ToolSearchItem } from '@/lib/catalog/search'
import { useIsClient } from '@/lib/hooks/use-is-client'
import type { TagChip } from '@/lib/types/catalog'

function toolEntries(cards: ReadonlyArray<ToolCardData>): Array<CategoryEntry> {
  return cards.map((card) => ({
    key: card.tool.key,
    name: card.tool.name,
    logo: { name: card.company.name, logoUrl: card.company.logoUrl },
    row: <ToolRow {...card} />,
  }))
}

type CapabilityGroup = {
  capability: { slug: string; label: string }
  cards: Array<ToolCardData>
}

function groupByCapability(
  results: ReadonlyArray<ToolSearchItem>,
  labels: ReadonlyMap<string, string>
): Array<CapabilityGroup> {
  const groups = new Map<string, CapabilityGroup>()
  for (const item of results) {
    const existing = groups.get(item.capability)
    if (existing) {
      existing.cards.push(item)
    } else {
      groups.set(item.capability, {
        capability: {
          slug: item.capability,
          label: labels.get(item.capability) ?? item.capability,
        },
        cards: [item],
      })
    }
  }
  return [...groups.values()].sort((a, b) =>
    a.capability.label.localeCompare(b.capability.label)
  )
}

const SHELF = 'capability:'

/** What a tool can be filtered by, and what the box offers first. */
const TOOL_KINDS = ['capability', 'has', 'category'] as const
const TOOL_EMPTY = { kinds: ['has', 'capability'], limit: 8 } as const

type ExplorerProps = {
  tools: ReadonlyArray<ToolSearchItem>
  tags: ReadonlyArray<TagChip>
}

const NO_PARAMS = new URLSearchParams()

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
  const capabilityLabels = new Map(
    tags
      .filter((tag) => tag.namespace === 'capability')
      .map((tag) => [tag.slug, tag.label])
  )
  const { results } = searchToolItems(tools, {
    q: state.words.join(' '),
    chips: state.chips,
  })

  const shelves = groupByCapability(results, capabilityLabels)
  const options = tagFilterOptions(
    tags.filter((tag) =>
      (TOOL_KINDS as ReadonlyArray<string>).includes(tag.namespace)
    ),
    (key) => tags.find((tag) => tag.key === key)?.counts.tools ?? 0
  )
  const active = state.chips
    .map((chip) => options.find((option) => option.key === chip))
    .filter((option): option is FilterOption => option !== undefined)
  const isExpanded = params.view === 'all'
  const selectedShelves = tags.filter(
    (tag) => tag.namespace === 'capability' && state.chips.includes(tag.key)
  )
  const resultsTitle =
    selectedShelves.length > 0
      ? selectedShelves.map((tag) => tag.label).join(' + ')
      : 'Results'
  const currentHref = searchHref('/tools', state)
  const hasContent = isBrowsing ? shelves.length > 0 : results.length > 0

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
        {shelves.map(({ capability, cards }) => (
          <CategorySection
            noun="tools"
            entries={toolEntries(cards)}
            key={capability.slug}
            moreHref={withExpandedView(
              searchHref('/tools', {
                words: [],
                chips: [`${SHELF}${capability.slug}`],
              })
            )}
            title={capability.label}
          />
        ))}
      </div>
    )
  } else {
    content = (
      <CategorySection
        noun="tools"
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
        as="h1"
        description="Single actions your agent can run, grouped by job."
        title="Discover tools"
      />

      <div className="flex flex-col gap-(--space-3xl)">
        <div className="flex flex-col gap-3">
          <FilterSearch
            action="/tools"
            active={active}
            clearHref="/tools"
            defaultValue={state.words.join(' ')}
            empty={TOOL_EMPTY}
            label="Search tools"
            options={options}
            params={chipParams(state.chips)}
            pickHref={(option, words) =>
              searchHref('/tools', {
                words: words ? [words] : [],
                chips: [...state.chips, option.key],
              })
            }
            placeholder={`Search ${tools.length} tools`}
            removeHref={(option) =>
              searchHref('/tools', {
                words: state.words,
                chips: state.chips.filter((chip) => chip !== option.key),
              })
            }
          />
          {unknown.length > 0 ? (
            <p className="type-helper text-soft">
              No filter matches {unknown.join(', ')}.
            </p>
          ) : null}
        </div>

        {content}
      </div>
    </div>
  )
}
