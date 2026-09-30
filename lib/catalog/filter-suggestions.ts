import type { TagNamespace } from './keys'
import { tokens } from './search-words'

/**
 * Which filter a reader means while they type in a listing's search box:
 * "outbound" is the Outbound motion, "email" the Email channel, "apollo" the
 * company. PURE, so the same match runs in the browser on each keystroke and
 * in a test. Picking a suggestion turns the matched words into a filter; the
 * rest of the text stays a word search.
 */

/** A filter the box can suggest: a tag, or a company whose tools are used. */
export type FilterOption = {
  /** `motion:outbound`, or `company:apollo`. */
  key: string
  kind: TagNamespace | 'company'
  label: string
  /** How many items the filter keeps. */
  count: number
}

export type FilterSuggestion = {
  option: FilterOption
  /** The typed text without the words the option matched. */
  rest: string
  /** The words ARE its name ("email"), not the start of it ("em"). */
  isExact: boolean
}

/** The kinds a reader reaches for first come first. */
const KIND_ORDER: ReadonlyArray<FilterOption['kind']> = [
  'motion',
  'channel',
  'company',
  'capability',
  'category',
  'has',
]

/** Offered before anything is typed, by default: the workflows' motions and
    channels, the few filters that split that list. */
const EMPTY_KINDS: ReadonlyArray<FilterOption['kind']> = ['motion', 'channel']

/** A word shorter than this matches too much to suggest anything. */
const MIN_PHRASE = 2

/** How many trailing words may name one filter ("product led"). */
const MAX_WORDS = 3

const WHITESPACE = /\s+/

type Match = { option: FilterOption; words: number; isExact: boolean }

/** The option's names, as words: its label and its slug. */
function names(option: FilterOption): Array<string> {
  const slug = option.key.slice(option.key.indexOf(':') + 1)
  return [tokens(option.label).join(' '), tokens(slug).join(' ')]
}

function matchOption(
  option: FilterOption,
  phrase: string,
  words: number
): Match | null {
  const candidates = names(option)
  if (candidates.includes(phrase)) {
    return { option, words, isExact: true }
  }
  const isHit = candidates.some(
    (name) =>
      name.startsWith(phrase) ||
      // One word may start any word of the name: "mcp" → "Has MCP".
      (words === 1 && name.split(' ').some((part) => part.startsWith(phrase)))
  )
  return isHit ? { option, words, isExact: false } : null
}

function byRelevance(a: Match, b: Match): number {
  return (
    Number(b.isExact) - Number(a.isExact) ||
    b.words - a.words ||
    KIND_ORDER.indexOf(a.option.kind) - KIND_ORDER.indexOf(b.option.kind) ||
    b.option.count - a.option.count ||
    a.option.label.localeCompare(b.option.label)
  )
}

/**
 * The filters the text's LAST words could mean, best first: an exact name
 * before a prefix, a longer phrase before a shorter one, then by kind and by
 * how many items each keeps. Nothing typed offers the listing's own first
 * filters (`empty`: its kinds in order, busiest first, up to its limit); a
 * trailing space means the last word is finished, so nothing is offered.
 */
export function suggestFilters(
  options: ReadonlyArray<FilterOption>,
  text: string,
  input: {
    active: ReadonlyArray<string>
    /** Caps the matches for typed words. */
    limit?: number
    /** What nothing typed offers; every motion and channel by default. */
    empty?: { kinds: ReadonlyArray<FilterOption['kind']>; limit?: number }
  }
): Array<FilterSuggestion> {
  const limit = input.limit ?? 6
  const open = options.filter(
    (option) => option.count > 0 && !input.active.includes(option.key)
  )
  if (text.trim() === '') {
    const kinds = input.empty?.kinds ?? EMPTY_KINDS
    return open
      .filter((option) => kinds.includes(option.kind))
      .sort(
        (a, b) =>
          kinds.indexOf(a.kind) - kinds.indexOf(b.kind) ||
          b.count - a.count ||
          a.label.localeCompare(b.label)
      )
      .slice(0, input.empty?.limit ?? open.length)
      .map((option) => ({ option, rest: '', isExact: false }))
  }
  if (WHITESPACE.test(text.slice(-1))) {
    return []
  }
  const words = text.trim().split(WHITESPACE)
  const best = new Map<string, Match>()
  for (let count = Math.min(MAX_WORDS, words.length); count >= 1; count -= 1) {
    const phrase = tokens(words.slice(-count).join(' ')).join(' ')
    if (phrase.length < MIN_PHRASE) {
      continue
    }
    for (const option of open) {
      const match = matchOption(option, phrase, count)
      const seen = best.get(option.key)
      if (match && !(seen && byRelevance(seen, match) <= 0)) {
        best.set(option.key, match)
      }
    }
  }
  return [...best.values()]
    .sort(byRelevance)
    .slice(0, limit)
    .map((match) => ({
      option: match.option,
      rest: words.slice(0, -match.words).join(' '),
      isExact: match.isExact,
    }))
}

/**
 * The filters a list of workflows offers: every tag at least one carries,
 * and every company whose tools one uses, each with how many it keeps.
 */
export function workflowFilterOptions(
  workflows: ReadonlyArray<{
    tags: ReadonlyArray<string>
    tools: ReadonlyArray<{ companyKey: string; companyName: string }>
  }>,
  tags: ReadonlyArray<{ key: string; namespace: TagNamespace; label: string }>
): Array<FilterOption> {
  const count = (key: string) =>
    workflows.filter((workflow) =>
      key.startsWith('company:')
        ? workflow.tools.some((tool) => `company:${tool.companyKey}` === key)
        : workflow.tags.includes(key)
    ).length
  const companies = new Map(
    workflows.flatMap((workflow) =>
      workflow.tools.map((tool) => [tool.companyKey, tool.companyName] as const)
    )
  )
  return [
    ...tags.map((tag) => ({
      key: tag.key,
      kind: tag.namespace,
      label: tag.label,
      count: count(tag.key),
    })),
    ...[...companies].map(([key, name]) => ({
      key: `company:${key}`,
      kind: 'company' as const,
      label: name,
      count: count(`company:${key}`),
    })),
  ].filter((option) => option.count > 0)
}

/**
 * A listing's tags as filters, each with how many of its items it keeps —
 * `tags` already narrowed to the namespaces the listing filters by.
 */
export function tagFilterOptions(
  tags: ReadonlyArray<{ key: string; namespace: TagNamespace; label: string }>,
  count: (key: string) => number
): Array<FilterOption> {
  return tags
    .map((tag) => ({
      key: tag.key,
      kind: tag.namespace,
      label: tag.label,
      count: count(tag.key),
    }))
    .filter((option) => option.count > 0)
}
