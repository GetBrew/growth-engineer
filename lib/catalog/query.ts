import { TAG_NAMESPACES, type TagNamespace } from '@/lib/catalog/keys'

/**
 * The search grammar, shared by the search box and the URL; MCP `search`
 * takes the same chips as filters and the same word matching
 * (./search-words.ts). PURE: no I/O, so the same parse runs in a Server Component, in the
 * proxy, and in a test.
 *
 *   words      free text → the full-text index
 *   chips      `namespace:slug` → tag filters
 *   grammar    chips in the SAME group mean OR, in DIFFERENT groups mean AND
 *   URL        /tools?q=enrich+linkedin&has=mcp,cli
 *   partial    `has:m` completes to `has:mcp` when it is the only match
 */

export const MAX_CHIPS = 8

export type SearchState = {
  words: ReadonlyArray<string>
  /** Full tag keys, deduplicated, in the order given. */
  chips: ReadonlyArray<string>
}

const CHIP_TOKEN = /^([a-z]+):([a-z0-9-]*)$/
const WHITESPACE = /\s+/
const SLUG = /^[a-z0-9-]+$/
const ENCODED_COMMA = /%2C/g

function isNamespace(value: string): value is TagNamespace {
  return (TAG_NAMESPACES as ReadonlyArray<string>).includes(value)
}

function dedupe(values: ReadonlyArray<string>): Array<string> {
  return [...new Set(values)]
}

/** Split typed text into words and chip tokens. Unknown namespaces stay words. */
export function parseSearchText(text: string): SearchState {
  const words: Array<string> = []
  const chips: Array<string> = []
  for (const raw of text.trim().split(WHITESPACE).filter(Boolean)) {
    const token = raw.toLowerCase()
    const match = CHIP_TOKEN.exec(token)
    if (match && isNamespace(match[1] ?? '')) {
      chips.push(token)
    } else {
      words.push(raw)
    }
  }
  return { words, chips: dedupe(chips).slice(0, MAX_CHIPS) }
}

/**
 * Resolve partial chips against the active tag keys: an exact key stays, a
 * unique-prefix match completes, anything else is reported as unknown so the
 * page can say "No tag matches has:xyz".
 */
export function completeChips(
  chips: ReadonlyArray<string>,
  tagKeys: ReadonlyArray<string>
): { chips: Array<string>; unknown: Array<string> } {
  const known = new Set(tagKeys)
  const resolved: Array<string> = []
  const unknown: Array<string> = []
  for (const chip of chips) {
    if (known.has(chip)) {
      resolved.push(chip)
      continue
    }
    const [namespace, slug] = chip.split(':')
    const candidates = tagKeys.filter(
      (key) =>
        key.startsWith(`${namespace}:`) && (slug === '' || key.startsWith(chip))
    )
    // Only a UNIQUE prefix completes: `capability:manage` could be four
    // tags, and picking one would search for something nobody asked for.
    if (slug && candidates.length === 1) {
      resolved.push(candidates[0] as string)
    } else {
      unknown.push(chip)
    }
  }
  return { chips: dedupe(resolved).slice(0, MAX_CHIPS), unknown }
}

type Params = Record<string, string | ReadonlyArray<string> | undefined>

/** A search param's first value, or '' when absent. */
function firstParam(value: string | ReadonlyArray<string> | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

/** `?q=…&capability=a,b&has=mcp` → state. */
export function searchStateFromParams(params: Params): SearchState {
  const words = firstParam(params.q).trim().split(WHITESPACE).filter(Boolean)
  const chips: Array<string> = []
  for (const namespace of TAG_NAMESPACES) {
    for (const slug of firstParam(params[namespace]).split(',')) {
      const clean = slug.trim().toLowerCase()
      if (clean && SLUG.test(clean)) {
        chips.push(`${namespace}:${clean}`)
      }
    }
  }
  return { words, chips: dedupe(chips).slice(0, MAX_CHIPS) }
}

/** State → the canonical URL. Namespaces in a fixed order so equal searches share one URL. */
export function searchHref(pathname: string, state: SearchState): string {
  const params = new URLSearchParams()
  if (state.words.length > 0) {
    params.set('q', state.words.join(' '))
  }
  for (const namespace of TAG_NAMESPACES) {
    const slugs = state.chips
      .filter((chip) => chip.startsWith(`${namespace}:`))
      .map((chip) => chip.slice(namespace.length + 1))
    if (slugs.length > 0) {
      params.set(namespace, slugs.join(','))
    }
  }
  const query = params.toString().replace(ENCODED_COMMA, ',')
  return query ? `${pathname}?${query}` : pathname
}

/**
 * Chips as a URL writes them — `?motion=outbound&channel=email,chat` — for a
 * link, or a search form's hidden fields, that keeps them on.
 */
export function chipParams(
  chips: ReadonlyArray<string>
): Record<string, string> {
  return Object.fromEntries(
    TAG_NAMESPACES.flatMap((namespace) => {
      const slugs = chips
        .filter((chip) => chip.startsWith(`${namespace}:`))
        .map((chip) => chip.slice(namespace.length + 1))
      return slugs.length > 0 ? [[namespace, slugs.join(',')]] : []
    })
  )
}

/** What the search box shows for a state: words, then chips. */
export function searchText(state: SearchState): string {
  return [...state.words, ...state.chips].join(' ')
}
