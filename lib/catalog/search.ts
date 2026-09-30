import type {
  CompanyListItem,
  PaletteItem,
  ToolListItem,
  WorkflowListItem,
} from '@/lib/types/catalog'
import {
  type CopyAngle,
  type CopyStatsByKey,
  rankByAngle,
} from '@/lib/usage/stats'
import { TAG_NAMESPACES, type TagNamespace } from './keys'
import { MAX_CHIPS } from './query'
import { matchWords, queryWords } from './search-words'

/**
 * Search v1, PURE and browser-safe: the same functions run in the build's
 * tests and in the client components that filter a prerendered listing. The
 * GRAMMAR is lib/catalog/query.ts (words + `namespace:slug` chips; OR within
 * a namespace, AND across; partial completion; the canonical URL); the WORDS
 * are read by ./search-words.ts (function words dropped, stems matched by
 * prefix). This file is the execution for the listings and the palette:
 * every word must match the item (a hit in the name counts double), and
 * chips filter on the facts each item carries — `has:` from a tool's
 * access, `capability:` from its header, `category:` from its company.
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
  /** The day it joined the catalog: what "New" sorts by. */
  addedAt: number
  updatedAt: number
  /** Position on the featured list (featured first, then newest added). */
  featuredIndex: number
}

export type CompanySearchItem = CompanyListItem & {
  searchText: string
  updatedAt: number
}

type Chip = { namespace: TagNamespace; slug: string; key: string }

/**
 * The words a listing matches, or null when the query asked for something
 * with no words at all (`???`, `—`): that matches nothing, not everything.
 * A kind word ("tools") says which listing, not what to find, so it drops.
 */
function listingWords(q: string): Array<string> | null {
  const read = queryWords(q)
  return read.isNothing ? null : read.words
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

/** 0 = no match; otherwise the weight of a match on EVERY word. */
function score(
  words: ReadonlyArray<string>,
  name: string,
  searchText: string
): number {
  if (words.length === 0) {
    return 1
  }
  const { matched, weight } = matchWords(words, name, searchText)
  return matched === words.length ? weight : 0
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
        // motion and channel describe workflows; no tool carries them.
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
  const words = listingWords(input.q)
  if (words === null) {
    return { results: [], chips: chips.map((chip) => chip.key) }
  }
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

export type WorkflowSort = 'featured' | 'new' | CopyAngle

/**
 * Workflows: featured order, newest added, or ranked by copies (Hot: this week;
 * Popular: all time — ties in featured order), within one tag and one
 * company whose tools they use, narrowed by words. A copy angle with no
 * `stats` is the featured order.
 */
export function searchWorkflowItems(
  items: ReadonlyArray<WorkflowSearchItem>,
  input: {
    q: string
    sort: WorkflowSort
    tag?: string
    /** A company key: only workflows using one of its tools. */
    company?: string
    limit?: number
    stats?: CopyStatsByKey | null
  }
): Array<WorkflowSearchItem> {
  const words = listingWords(input.q)
  if (words === null) {
    return []
  }
  const { sort, stats } = input
  const inTag = items
    .filter((item) => !input.tag || item.tags.includes(input.tag))
    .filter(
      (item) =>
        !input.company ||
        item.tools.some((tool) => tool.companyKey === input.company)
    )
    .sort((a, b) =>
      sort === 'new'
        ? b.addedAt - a.addedAt || a.workflow.key.localeCompare(b.workflow.key)
        : a.featuredIndex - b.featuredIndex
    )
  const ordered =
    (sort === 'hot' || sort === 'popular') && stats
      ? rankByAngle(inTag, (item) => item.workflow.key, stats, sort)
      : inTag
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
  const words = listingWords(input.q)
  if (words === null) {
    return []
  }
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
  const words = listingWords(input.q)
  if (words === null) {
    return []
  }
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
