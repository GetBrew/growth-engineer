import { Search, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ToolCard } from '@/components/catalog/cards'
import {
  EmptyState,
  Page,
  PillLink,
  SectionHeading,
} from '@/components/catalog/primitives'
import { ToolCardsSkeleton } from '@/components/catalog/skeletons'
import { loadActiveTags, searchTools } from '@/lib/catalog/loaders'
import {
  completeChips,
  parseSearchText,
  searchHref,
  searchStateFromParams,
  searchText,
  toggleChip,
} from '@/lib/catalog/query'

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Every tool an agent can reach over MCP, CLI or API, with the file to set it up.',
}

type SearchParams = Promise<Record<string, string | Array<string> | undefined>>

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
    <Page className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        description="Chips in the same group mean “or”; chips in different groups mean “and”. Type a chip like has:mcp, or pick one below."
        title="Tools"
      />
      <Suspense fallback={<ToolCardsSkeleton cards={9} />}>
        <ToolsSearch searchParams={searchParams} />
      </Suspense>
    </Page>
  )
}

async function ToolsSearch({ searchParams }: { searchParams: SearchParams }) {
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
  const { results } = await searchTools(state.words.join(' '), state.chips)

  const byNamespace = (namespace: string) =>
    tags.filter((tag) => tag.namespace === namespace)
  const labelFor = new Map(tags.map((tag) => [tag.key, tag.label]))

  return (
    <div className="flex flex-col gap-6">
      <form action="/tools" className="relative" method="get">
        <span className="sr-only">Search tools</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-foreground/45"
        />
        <input
          autoComplete="off"
          className="focus-ring h-13 w-full rounded-full border border-border bg-white pr-5 pl-13 font-mono text-sm placeholder:text-foreground/40"
          defaultValue={searchText(state)}
          name="q"
          placeholder="enrich linkedin agent:native has:mcp"
          type="search"
        />
      </form>

      {unknown.length > 0 ? (
        <p className="text-sm text-workflow">
          No tag matches {unknown.join(', ')}. Pick one below instead.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <ChipRow
          label="Reachable over"
          state={state}
          tags={byNamespace('has')}
        />
        <ChipRow
          label="Agent readiness"
          state={state}
          tags={byNamespace('agent')}
        />
        <ChipRow
          label="Capability"
          state={state}
          tags={byNamespace('capability')}
        />
        <details className="group/more">
          <summary className="focus-ring w-fit cursor-pointer list-none rounded-full text-foreground/60 text-sm hover:text-foreground [&::-webkit-details-marker]:hidden">
            More filters: motion, channel, category, fit ▾
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <ChipRow
              label="Motion"
              state={state}
              tags={byNamespace('motion')}
            />
            <ChipRow
              label="Channel"
              state={state}
              tags={byNamespace('channel')}
            />
            <ChipRow
              label="Category"
              state={state}
              tags={byNamespace('category')}
            />
            <ChipRow label="Fit" state={state} tags={byNamespace('fit')} />
          </div>
        </details>
      </div>

      {state.chips.length > 0 || state.words.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-foreground/55">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
          {state.chips.map((chip) => (
            <Link
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-tag/50 bg-tag/5 py-1 pr-2 pl-3 font-mono text-[12px] text-foreground"
              href={searchHref('/tools', toggleChip(state, chip))}
              key={chip}
              title={labelFor.get(chip)}
            >
              <span className="text-tag">{chip.split(':')[0]}:</span>
              {chip.split(':')[1]}
              <X aria-hidden="true" className="size-3 text-foreground/50" />
            </Link>
          ))}
          <Link
            className="text-foreground/55 hover:text-foreground"
            href="/tools"
          >
            Clear
          </Link>
        </div>
      ) : null}

      {results.length === 0 ? (
        <EmptyState
          hint="Fewer chips, or different words."
          title="No tools match"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((card) => (
            <ToolCard key={card.tool._id} {...card} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChipRow({
  label,
  tags,
  state,
}: {
  label: string
  tags: Array<{ key: string; label: string; counts: { tools: number } }>
  state: { words: ReadonlyArray<string>; chips: ReadonlyArray<string> }
}) {
  if (tags.length === 0) {
    return null
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full text-[11px] text-foreground/50 uppercase tracking-[0.12em] sm:w-32">
        {label}
      </span>
      {tags.map((tag) => (
        <PillLink
          active={state.chips.includes(tag.key)}
          href={searchHref('/tools', toggleChip(state, tag.key))}
          key={tag.key}
        >
          {tag.label}
          <span className="text-[11px] opacity-60">{tag.counts.tools}</span>
        </PillLink>
      ))}
    </div>
  )
}
