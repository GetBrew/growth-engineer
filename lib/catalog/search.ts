import type {
  CompanyListItem,
  PaletteItem,
  ToolListItem,
  WorkflowListItem,
} from '@/lib/types/catalog'
import { TAG_NAMESPACES, type TagNamespace } from './keys'
import { MAX_CHIPS } from './query'

/**
 * Search v1, PURE and browser-safe: the same functions run in the build's
 * tests and in the client components that filter a prerendered listing. The
 * GRAMMAR is lib/catalog/query.ts (words + `namespace:slug` chips; OR within
 * a namespace, AND across; partial completion; the canonical URL). This file
 * is the execution: every word must start a token of the item's search text
 * (a hit in the name counts double), and chips filter on the facts each item
 * carries — `has:` from a tool's access, `capability:` from its
 * slug, `category:` from its company.
 *
 * Items are the list rows plus the few fields search needs, so a page can
 * ship every item once, prerendered, and answer any filter permutation in
 * the browser without a server round trip.
 */

export type ToolSearchItem = ToolListItem & {
  capability: string
  searchText: string
  updatedAt: number
}

export type WorkflowSearchItem = WorkflowListItem & {
  tags: ReadonlyArray<string>
  searchText: string
  updatedAt: number
  /** Position on the featured list (editorial rank first, then newest). */
  featuredIndex: number
}

export type CompanySearchItem = CompanyListItem & {
  searchText: string
  updatedAt: number
}

type Chip = { namespace: TagNamespace; slug: string; key: string }

const TOKEN = /[^a-z0-9]+/

function tokens(text: string): Array<string> {
  return text.toLowerCase().split(TOKEN).filter(Boolean)
}

/** `capability:enrich-contacts` → chip; anything malformed is dropped. */
function parseChips(raw: ReadonlyArray<string>): Array<Chip> {
  const chips: Array<Chip> = []
  for (const value of raw.slice(0, MAX_CHIPS)) {
    const [namespace, slug, ...rest] = value.toLowerCase().split(':')
    if (!(namespace && slug) || rest.length > 0) {
      continue
    }
    if ((TAG_NAMESPACES as ReadonlyArray<string>).includes(namespace)) {
      chips.push({ namespace: namespace as TagNamespace, slug, key: value })
    }
  }
  return chips
}

function groupByNamespace(
  chips: ReadonlyArray<Chip>
): Map<TagNamespace, Array<string>> {
  const groups = new Map<TagNamespace, Array<string>>()
  for (const chip of chips) {
    groups.set(chip.namespace, [
      ...(groups.get(chip.namespace) ?? []),
      chip.slug,
    ])
  }
  return groups
}

/** 0 = no match; otherwise the sum of word scores (name hits count double). */
function score(
  words: ReadonlyArray<string>,
  name: string,
  searchText: string
): number {
  if (words.length === 0) {
    return 1
  }
  const nameTokens = tokens(name)
  const allTokens = tokens(searchText)
  let total = 0
  for (const word of words) {
    if (nameTokens.some((token) => token.startsWith(word))) {
      total += 2
    } else if (allTokens.some((token) => token.startsWith(word))) {
      total += 1
    } else {
      return 0
    }
  }
  return total
}

type Scored<T> = { item: T; score: number; index: number; key: string }

/** With words: score desc, newest, key. Without: the order given. */
function rank<T extends { updatedAt: number }>(
  scored: Array<Scored<T>>,
  hasWords: boolean
): Array<T> {
  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) =>
      hasWords
        ? b.score - a.score ||
          b.item.updatedAt - a.item.updatedAt ||
          a.key.localeCompare(b.key)
        : a.index - b.index
    )
    .map((entry) => entry.item)
}

/** Does the tool satisfy every chip group? OR within a group, AND across. */
function toolMatchesChips(
  item: ToolSearchItem,
  groups: ReadonlyMap<TagNamespace, ReadonlyArray<string>>
): boolean {
  for (const [namespace, slugs] of groups) {
    let hits: ReadonlyArray<string>
    switch (namespace) {
      case 'has':
        hits = item.tool.access
        break
      case 'capability':
        hits = [item.capability]
        break
      case 'category':
        hits = item.category ? [item.category.slug] : []
        break
      default:
        // motion, channel, fit describe workflows; no tool carries them.
        hits = []
    }
    if (!slugs.some((slug) => hits.includes(slug))) {
      return false
    }
  }
  return true
}

/** Tools in the order given (newest first), narrowed by chips and words. */
export function searchToolItems(
  items: ReadonlyArray<ToolSearchItem>,
  input: { q: string; chips: ReadonlyArray<string>; limit?: number }
): { results: Array<ToolSearchItem>; chips: Array<string> } {
  const chips = parseChips(input.chips)
  const groups = groupByNamespace(chips)
  const words = tokens(input.q)
  const ranked = rank(
    items
      .filter((item) => toolMatchesChips(item, groups))
      .map((item, index) => ({
        item,
        index,
        key: item.tool.key,
        score: score(words, item.tool.name, item.searchText),
      })),
    words.length > 0
  )
  return {
    results: ranked.slice(0, input.limit ?? ranked.length),
    chips: chips.map((chip) => chip.key),
  }
}

/** Workflows: featured order or newest, within one tag, narrowed by words. */
export function searchWorkflowItems(
  items: ReadonlyArray<WorkflowSearchItem>,
  input: { q: string; sort: 'featured' | 'new'; tag?: string; limit?: number }
): Array<WorkflowSearchItem> {
  const words = tokens(input.q)
  const ordered = items
    .filter((item) => !input.tag || item.tags.includes(input.tag))
    .sort((a, b) =>
      input.sort === 'new'
        ? b.updatedAt - a.updatedAt ||
          a.workflow.key.localeCompare(b.workflow.key)
        : a.featuredIndex - b.featuredIndex
    )
  const ranked = rank(
    ordered.map((item, index) => ({
      item,
      index,
      key: item.workflow.key,
      score: score(words, item.workflow.title, item.searchText),
    })),
    words.length > 0
  )
  return ranked.slice(0, input.limit ?? ranked.length)
}

/** Companies in the order given (by name), within one category, by words. */
export function searchCompanyItems(
  items: ReadonlyArray<CompanySearchItem>,
  input: { q: string; category?: string; limit?: number }
): Array<CompanySearchItem> {
  const words = tokens(input.q)
  const ranked = rank(
    items
      .filter(
        (item) => !input.category || item.category?.slug === input.category
      )
      .map((item, index) => ({
        item,
        index,
        key: item.company.key,
        score: score(words, item.company.name, item.searchText),
      })),
    words.length > 0
  )
  return ranked.slice(0, input.limit ?? ranked.length)
}

/**
 * The ⌘K palette: one flat list across all three kinds, so a reader who types
 * "clay" sees the company, its tools and the workflows that use it together
 * rather than having to guess which listing to open first. Pure, like the
 * rest of this file — the layout ships every item once and this runs in the
 * browser on each keystroke.
 */
export function searchPaletteItems(
  items: ReadonlyArray<PaletteItem>,
  input: { q: string; limit?: number }
): Array<PaletteItem> {
  const words = tokens(input.q)
  const ranked = rank(
    items.map((item, index) => ({
      item,
      index,
      key: `${item.kind}:${item.key}`,
      score: score(words, item.title, item.searchText),
    })),
    words.length > 0
  )
  return ranked.slice(0, input.limit ?? ranked.length)
}
