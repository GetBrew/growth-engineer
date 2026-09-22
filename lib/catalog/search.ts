import type { Catalog } from '@/lib/content/build-catalog'
import { TAG_NAMESPACES, type TagNamespace } from './keys'
import { companyListItem, toolListItem, workflowListItem } from './lists'
import { MAX_CHIPS } from './query'
import type {
  Company,
  CompanyListItem,
  Tool,
  ToolListItem,
  WorkflowListItem,
} from './types'

/**
 * Search v1, in memory over the built catalog. The GRAMMAR is lib/catalog/
 * query.ts (words + `namespace:slug` chips, OR within a namespace, AND across
 * them); this file is the execution: every word must start a token of the
 * entity's search text, hits in the name count double, and chips filter on
 * the facts each entity carries — `agent:` and `has:` from a tool's access,
 * `capability:` from its slug, `category:` from its company.
 */

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

function rank<T extends { key: string; updatedAt: number }>(
  scored: Array<{ entity: T; score: number }>
): Array<T> {
  return scored
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.entity.updatedAt - a.entity.updatedAt ||
        a.entity.key.localeCompare(b.entity.key)
    )
    .map((entry) => entry.entity)
}

/** Does the tool satisfy every chip group? OR within a group, AND across. */
function toolMatchesChips(
  catalog: Catalog,
  tool: Tool,
  groups: ReadonlyMap<TagNamespace, ReadonlyArray<string>>
): boolean {
  for (const [namespace, slugs] of groups) {
    let hits: ReadonlyArray<string>
    switch (namespace) {
      case 'agent':
        hits = [tool.agentLevel]
        break
      case 'has':
        hits = tool.access.map((entry) => entry.type)
        break
      case 'capability':
        hits = [tool.capability]
        break
      case 'category':
        hits = [catalog.companies.get(tool.companyKey)?.category ?? '']
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

export function searchTools(
  catalog: Catalog,
  input: { q: string; chips: ReadonlyArray<string>; limit: number }
): { results: Array<ToolListItem>; chips: Array<string> } {
  const chips = parseChips(input.chips)
  const groups = groupByNamespace(chips)
  const words = tokens(input.q)
  const published = catalog.order.toolsNew.flatMap((key) => {
    const tool = catalog.tools.get(key)
    return tool ? [tool] : []
  })
  const ranked = rank(
    published
      .filter((tool) => toolMatchesChips(catalog, tool, groups))
      .map((tool) => ({
        entity: tool,
        score: score(words, tool.name, tool.searchText),
      }))
  )
  return {
    results: ranked
      .slice(0, input.limit)
      .map((tool) => toolListItem(catalog, tool)),
    chips: chips.map((chip) => chip.key),
  }
}

export function searchWorkflows(
  catalog: Catalog,
  input: { q: string; sort: 'featured' | 'new'; tag?: string; limit: number }
): Array<WorkflowListItem> {
  const words = tokens(input.q)
  if (words.length === 0) {
    return []
  }
  if (input.tag && !catalog.tags.has(input.tag)) {
    return []
  }
  const order =
    input.sort === 'new'
      ? catalog.order.workflowsNew
      : catalog.order.workflowsFeatured
  const candidates = order.flatMap((key) => {
    const workflow = catalog.workflows.get(key)
    return workflow && (!input.tag || workflow.tags.includes(input.tag))
      ? [workflow]
      : []
  })
  const scored = candidates.map((workflow, index) => ({
    entity: workflow,
    score: score(words, workflow.title, workflow.searchText),
    index,
  }))
  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, input.limit)
    .map((entry) => workflowListItem(catalog, entry.entity))
}

export function searchCompanies(
  catalog: Catalog,
  input: { q: string; category?: string; limit: number }
): Array<CompanyListItem> {
  const words = tokens(input.q)
  if (words.length === 0) {
    return []
  }
  if (input.category && !catalog.tags.has(`category:${input.category}`)) {
    return []
  }
  const candidates: Array<Company> = catalog.order.companies.flatMap((key) => {
    const company = catalog.companies.get(key)
    return company && (!input.category || company.category === input.category)
      ? [company]
      : []
  })
  return rank(
    candidates.map((company) => ({
      entity: company,
      score: score(words, company.name, company.searchText),
    }))
  )
    .slice(0, input.limit)
    .map((company) => companyListItem(catalog, company))
}
