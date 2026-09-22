import { ArrowRight02Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { type ReactNode, Suspense } from 'react'
import { type ToolCardData, ToolRow } from '@/components/catalog/cards'
import { CatalogSearch } from '@/components/catalog/catalog-search'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { ListingToolbar } from '@/components/catalog/listing-toolbar'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { ToolsSkeleton } from '@/components/skeletons/tools-skeleton'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { loadActiveTags, searchTools } from '@/lib/catalog/loaders'
import {
  completeChips,
  parseSearchText,
  searchHref,
  searchStateFromParams,
  searchText,
} from '@/lib/catalog/query'

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Every tool an agent can reach over MCP, CLI or API, with the file to set it up.',
}

type SearchParams = Promise<Record<string, string | Array<string> | undefined>>

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
          <ToolRow key={card.tool._id} {...card} />
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
                key={card.tool._id}
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

/**
 * One box searches everything: words go to the full-text index, chips like
 * `has:mcp` filter by tag, and the URL IS the query — an agent can use the
 * same URL, or call MCP `search` with the same values.
 */
export default function ToolsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <>
      <HeroBanner
        description="Discover agent-ready tools available through MCP, CLI, and API."
        eyebrow="Tools"
        icon="/tool.svg"
        title="Tools your agent can run"
      >
        <HeroActions>
          <Link className={buttonVariants({ size: 'pill' })} href="/submit">
            Submit a tool
          </Link>
        </HeroActions>
      </HeroBanner>
      <Page className="flex flex-col gap-8">
        <SectionHeading
          description="Every tool an agent can reach over MCP, CLI or API."
          title="Discover tools"
        />
        <Suspense fallback={<ToolsSkeleton />}>
          <ToolsSearch searchParams={searchParams} />
        </Suspense>
      </Page>
    </>
  )
}

async function ToolsSearch({ searchParams }: { searchParams: SearchParams }) {
  // The tag list is a plain (uncached) read, so say plainly that this subtree
  // is request-time: without it Next's prospective prerender walks into the
  // Convex client and reports its `Math.random()` as an unstable value.
  await connection()
  const params = await searchParams
  // `q` may carry chips typed inline; lift them into the chip set.
  const typed = parseSearchText(searchStateFromParams(params).words.join(' '))
  const fromParams = searchStateFromParams(params)
  const rawState = {
    words: typed.words,
    chips: [...new Set([...fromParams.chips, ...typed.chips])],
  }

  const tags = await loadActiveTags()
  const tagKeys = tags.map((tag) => tag.key)
  const { chips, unknown } = completeChips(rawState.chips, tagKeys)
  const state = { words: rawState.words, chips }
  const isBrowsing = state.chips.length === 0 && state.words.length === 0
  const categoryChips = state.chips.filter((chip) =>
    chip.startsWith('category:')
  )
  const searchChips = state.chips.filter(
    (chip) => !chip.startsWith('category:')
  )
  const searchResult = await searchTools(state.words.join(' '), state.chips)
  const results = searchResult.results
  const categoryGroups = [
    ...results
      .reduce(
        (groups, card) => {
          const { category } = card
          if (!category) {
            return groups
          }
          const existing = groups.get(category.slug)
          if (existing) {
            existing.cards.push(card)
          } else {
            groups.set(category.slug, { category, cards: [card] })
          }
          return groups
        },
        new Map<
          string,
          {
            category: { slug: string; label: string }
            cards: Array<ToolCardData>
          }
        >()
      )
      .values(),
  ].sort((a, b) => a.category.label.localeCompare(b.category.label))
  const categoryOptions = tags
    .filter((tag) => tag.namespace === 'category' && tag.counts.companies > 0)
    .map((tag) => ({ key: tag.key, label: tag.label }))
  const rawView = Array.isArray(params.view) ? params.view[0] : params.view
  const isExpanded = rawView === 'all'
  const selectedCategories = tags.filter(
    (tag) => tag.namespace === 'category' && state.chips.includes(tag.key)
  )
  let resultsTitle = 'Results'
  if (selectedCategories.length > 0) {
    resultsTitle = selectedCategories.map((tag) => tag.label).join(' + ')
  }
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
        {categoryGroups.map(({ category, cards }) => {
          const categoryHref = searchHref('/tools', {
            words: [],
            chips: [`category:${category.slug}`],
          })
          return (
            <ToolSection
              cards={cards}
              key={category.slug}
              moreHref={withExpandedView(categoryHref)}
              title={category.label}
            />
          )
        })}
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
