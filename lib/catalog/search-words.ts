import type { EntityType } from './keys'

/**
 * How a query's words are read — shared by every search surface (the ⌘K
 * palette, the three listings, MCP `search`), so "enriching" finds the same
 * thing everywhere. Agents write sentences ("find a workflow to enrich
 * leads"); people type fragments. Both reduce to the words that carry meaning:
 *
 *   - function words ("a", "to", "for", "the") are dropped, unless the query
 *     is nothing but function words;
 *   - kind words ("workflow", "tools", "vendor") name what to look for, not
 *     what it says — the caller turns one into a type filter;
 *   - each remaining word is trimmed to a stem ("enriching" → "enrich"), and
 *     matching is by prefix, so a stem only ever WIDENS a match.
 *
 * PURE MODULE: type-only imports; runs in the browser, the build and /mcp.
 */

/** Letters and digits in any script; accents fold away (`Zoë` → `zoe`). */
const TOKEN = /[^\p{L}\p{N}]+/u
const COMBINING_MARKS = /\p{M}+/gu

export function tokens(text: string): Array<string> {
  return text
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .split(TOKEN)
    .filter(Boolean)
}

const STOP_WORDS: ReadonlySet<string> = new Set([
  'a',
  'about',
  'after',
  'all',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'best',
  'by',
  'can',
  'do',
  'does',
  'each',
  'for',
  'from',
  'good',
  'help',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'its',
  'me',
  'my',
  'need',
  'of',
  'on',
  'or',
  'our',
  'so',
  'some',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'this',
  'to',
  'up',
  'us',
  'use',
  'using',
  'via',
  'want',
  'we',
  'what',
  'when',
  'which',
  'who',
  'with',
  'you',
  'your',
])

/** The words that name a KIND of entry rather than describe one. */
const KIND_WORDS: ReadonlyMap<string, EntityType> = new Map([
  ['workflow', 'workflow'],
  ['workflows', 'workflow'],
  ['playbook', 'workflow'],
  ['playbooks', 'workflow'],
  ['tool', 'tool'],
  ['tools', 'tool'],
  ['company', 'company'],
  ['companies', 'company'],
  ['vendor', 'company'],
  ['vendors', 'company'],
])

/** Longest first; a stem keeps at least four letters. */
const SUFFIXES = ['ments', 'ment', 'ings', 'ing', 'ies', 'ed', 'es', 's']
const DOUBLED = /([b-df-hj-np-tv-z])\1$/
/** Doubled letters English keeps: "calling" → "call", not "cal". */
const KEPT_DOUBLE = /(ll|ss|ff|zz)$/

/**
 * "enriching" → "enrich", "companies" → "compan", "funded" → "fund". The
 * stem is always a prefix of the word, and tokens are matched by prefix, so
 * stemming can only find more, never lose an exact hit.
 */
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    const base = word.slice(0, -suffix.length)
    if (word.endsWith(suffix) && base.length >= (suffix === 's' ? 3 : 4)) {
      // "planning" → "plann" → "plan"; "calls" keeps its doubled l.
      return (suffix === 'ing' || suffix === 'ed') &&
        DOUBLED.test(base) &&
        !KEPT_DOUBLE.test(base)
        ? base.slice(0, -1)
        : base
    }
  }
  return word
}

export type QueryWords = {
  /** The stems to match, in query order. */
  words: Array<string>
  /** The one kind the query named, if it named exactly one. */
  kind?: EntityType
  /** The query had text but no letters or digits (`???`): it matches nothing. */
  isNothing: boolean
}

export function queryWords(q: string): QueryWords {
  const all = tokens(q)
  const kinds = new Set(
    all.flatMap((word) => {
      const kind = KIND_WORDS.get(word)
      return kind ? [kind] : []
    })
  )
  const content = all.filter((word) => !KIND_WORDS.has(word))
  const meaningful = content.filter((word) => !STOP_WORDS.has(word))
  const words = (meaningful.length > 0 ? meaningful : content).map(stem)
  const [kind] = kinds
  return {
    words,
    ...(kinds.size === 1 && kind ? { kind } : {}),
    isNothing: all.length === 0 && q.trim() !== '',
  }
}

/** How well an entry matches: words found, weight (a title hit counts double). */
export function matchWords(
  words: ReadonlyArray<string>,
  title: string,
  searchText: string
): { matched: number; weight: number } {
  const titleTokens = tokens(title)
  const allTokens = tokens(searchText)
  let matched = 0
  let weight = 0
  for (const word of words) {
    if (titleTokens.some((token) => token.startsWith(word))) {
      matched += 1
      weight += 2
    } else if (allTokens.some((token) => token.startsWith(word))) {
      matched += 1
      weight += 1
    }
  }
  return { matched, weight }
}
