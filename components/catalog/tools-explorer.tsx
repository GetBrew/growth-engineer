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

type CapabilityGroup = {
  capability: { slug: string; label: string }
  cards: Array<ToolCardData>
}

/**
 * Tools shelved by the job they do — every vendor's "Enrich a person" side by
 * side — which is what makes them comparable.
 */
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

/** The one fact filter worth a pill: tools an agent reaches over MCP. */
const HAS_MCP = 'has:mcp'
const SHELF = 'capability:'

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
  const isPill = (chip: string) => chip.startsWith(SHELF) || chip === HAS_MCP
  const pillChips = state.chips.filter(isPill)
  const searchChips = state.chips.filter((chip) => !isPill(chip))
  const capabilityLabels = new Map(
    tags
      .filter((tag) => tag.namespace === 'capability')
      .map((tag) => [tag.slug, tag.label])
  )
  const { results } = searchToolItems(tools, {
    q: state.words.join(' '),
    chips: state.chips,
  })
  // An empty search is dropped from the tabs, or every tab opens nothing.
  const tabWords = results.length > 0 ? state.words : []
  const toggle = (chip: string) =>
    searchHref('/tools', {
      words: tabWords,
      chips: pillChips.includes(chip)
        ? [...searchChips, ...pillChips.filter((other) => other !== chip)]
        : [...searchChips, ...pillChips, chip],
    })
  const shelves = groupByCapability(results, capabilityLabels)
  // Counted, so FilterPills shows the busiest few and puts the rest under
  // More; "Has MCP" has no count, so it always keeps its place up front.
  const toolsPerCapability = new Map(
    groupByCapability(tools, capabilityLabels).map((group) => [
      group.capability.slug,
      group.cards.length,
    ])
  )
  const capabilityOptions = tags
    .filter((tag) => tag.namespace === 'capability')
    .map((tag) => ({
      key: tag.key,
      label: tag.label,
      count: toolsPerCapability.get(tag.slug) ?? 0,
    }))
    .filter((option) => option.count > 0)
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
          <ListingToolbar
            groups={[
              {
                key: 'capability',
                label: 'Filter tools by what they do',
                all: {
                  href: searchHref('/tools', {
                    words: tabWords,
                    chips: searchChips,
                  }),
                  active: pillChips.length === 0,
                },
                moreTitle: 'More jobs',
                options: [
                  {
                    key: HAS_MCP,
                    label: 'Has MCP',
                    href: toggle(HAS_MCP),
                    active: pillChips.includes(HAS_MCP),
                  },
                  ...capabilityOptions.map((option) => ({
                    ...option,
                    href: toggle(option.key),
                    active: pillChips.includes(option.key),
                  })),
                ],
              },
            ]}
            search={
              <CatalogSearch
                action="/tools"
                // A trailing space when chips are shown, so a word typed after
                // `capability:enrich-contacts` starts a new token instead of joining it.
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
