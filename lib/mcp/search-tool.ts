import { z } from 'zod'
import { ENTITY_TYPES, formatRef, refToFilePath } from '@/lib/catalog/keys'
import { MAX_CHIPS } from '@/lib/catalog/query'
import { matchWords, queryWords } from '@/lib/catalog/search-words'
import type { Catalog } from '@/lib/content/build-catalog'
import { type Entry, mcpEntries } from './entries'
import { closest } from './suggest'
import { type ToolResult, toolError } from './tool-result'

/**
 * MCP `search`: words and filters in, refs out. Every argument narrows —
 * `type`, `tags` (one per namespace named, OR within a namespace), `company`
 * (the company, its tools, the workflows using them), `uses` (the workflows
 * using a tool), `author` (a person's workflows). With neither words nor
 * filters it browses: featured workflows first.
 *
 * Words are read like everywhere else on the site (catalog/search-words):
 * function words drop, "workflow"/"tool"/"company" pick the type, stems
 * match by prefix. When no entry matches every word, the closest matches
 * come back with `isPartial: true` instead of nothing.
 */

const DEFAULT_LIMIT = 10
const COMPANY_REF = /^company:/
const TOOL_REF = /^tool:/
const MAX_LIMIT = 50

export function searchArgs(tagKeys: ReadonlyArray<string>) {
  const tag =
    tagKeys.length > 0
      ? z.enum(tagKeys as [string, ...Array<string>])
      : z.string()
  return z.strictObject({
    query: z
      .string()
      .max(200)
      .optional()
      .describe(
        'Words to look for, in any form: "outbound workflow", "enrich leads", "stripe". Optional.'
      ),
    type: z.enum(ENTITY_TYPES).optional().describe('Only this kind of entry.'),
    tags: z
      .array(tag)
      .max(MAX_CHIPS)
      .optional()
      .describe(
        'Tag keys. An entry needs one tag from every namespace you name (capability: what a tool does; category: what a company is; motion and channel: what a workflow serves; has: a way in — mcp, cli or api).'
      ),
    company: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .optional()
      .describe(
        'A company handle (`apollo`): the company, its tools, and the workflows that use them.'
      ),
    uses: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional()
      .describe(
        'A tool key (`apollo/enrich-person`): the workflows that use it.'
      ),
    author: z
      .string()
      .trim()
      .min(1)
      .max(39)
      .optional()
      .describe("A GitHub login: that person's workflows."),
    limit: z
      .int()
      .min(1)
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT)
      .describe(
        `At most this many results (default ${DEFAULT_LIMIT}); \`total\` says how many matched.`
      ),
  })
}

const resultRow = z.strictObject({
  ref: z.string(),
  type: z.enum(ENTITY_TYPES),
  title: z.string(),
  summary: z.string(),
  url: z.string().describe('The markdown file.'),
  tags: z.array(z.string()),
  company: z.string().optional().describe('Tool rows: the maker, as a ref.'),
  author: z.string().optional().describe('Workflow rows: the author.'),
})

export const searchOutput = z.strictObject({
  results: z.array(resultRow),
  total: z.int(),
  isPartial: z
    .boolean()
    .describe('True when no entry matched every word: these match some.'),
})

type SearchArgs = z.infer<ReturnType<typeof searchArgs>>
type Row = z.infer<typeof resultRow>

function tagsMatch(entry: Entry, tags: ReadonlyArray<string>): boolean {
  const byNamespace = new Map<string, Array<string>>()
  for (const tag of tags) {
    const namespace = tag.split(':')[0] ?? ''
    byNamespace.set(namespace, [...(byNamespace.get(namespace) ?? []), tag])
  }
  return [...byNamespace.values()].every((group) =>
    group.some((tag) => entry.tags.includes(tag))
  )
}

function companyMatch(entry: Entry, company: string): boolean {
  switch (entry.kind) {
    case 'company':
      return entry.key === company
    case 'tool':
      return entry.company === company
    default:
      return entry.companies?.includes(company) ?? false
  }
}

/** A filter's value, checked: the catalog's own key, or an error to return. */
function resolveFilters(
  catalog: Catalog,
  args: SearchArgs
):
  | { company?: string; uses?: string; author?: string }
  | { error: ToolResult } {
  // Old keys follow their rename, as they do everywhere else.
  const current = (type: 'company' | 'tool', key: string | undefined) =>
    key ? (catalog.aliases.get(`${type}:${key}`) ?? key) : undefined
  const company = current(
    'company',
    args.company?.replace(COMPANY_REF, '').toLowerCase()
  )
  if (company && !catalog.companies.has(company)) {
    return {
      error: toolError(
        `No company "${company}".${closest(company, [...catalog.companies.keys()])}`
      ),
    }
  }
  const uses = current('tool', args.uses?.replace(TOOL_REF, '').toLowerCase())
  if (uses && !catalog.tools.has(uses)) {
    return {
      error: toolError(
        `No tool "${uses}".${closest(uses, [...catalog.tools.keys()])}`
      ),
    }
  }
  const authors = [
    ...new Set([...catalog.workflows.values()].map((w) => w.author)),
  ]
  const author = args.author
    ? authors.find(
        (login) => login.toLowerCase() === args.author?.toLowerCase()
      )
    : undefined
  if (args.author && !author) {
    return {
      error: toolError(
        `No workflows by "${args.author}".${closest(args.author, authors)}`
      ),
    }
  }
  return {
    ...(company ? { company } : {}),
    ...(uses ? { uses } : {}),
    ...(author ? { author } : {}),
  }
}

function toRow(entry: Entry, origin: string): Row {
  return {
    ref: entry.ref,
    type: entry.kind,
    title: entry.title,
    summary: entry.summary,
    url: `${origin}${refToFilePath({ type: entry.kind, key: entry.key })}`,
    tags: [...entry.tags],
    ...(entry.company ? { company: formatRef('company', entry.company) } : {}),
    ...(entry.author ? { author: entry.author } : {}),
  }
}

export function runSearch(
  catalog: Catalog,
  origin: string,
  args: SearchArgs
): ToolResult {
  const filters = resolveFilters(catalog, args)
  if ('error' in filters) {
    return filters.error
  }
  const read = queryWords(args.query ?? '')
  const type = args.type ?? read.kind
  if ((filters.author || filters.uses) && type && type !== 'workflow') {
    return toolError(
      '`author` and `uses` find workflows; drop `type` or set it to "workflow".'
    )
  }
  const candidates = read.isNothing
    ? []
    : mcpEntries(catalog).filter(
        (entry) =>
          (!type || entry.kind === type) &&
          tagsMatch(entry, args.tags ?? []) &&
          (!filters.company || companyMatch(entry, filters.company)) &&
          (!filters.uses || entry.toolKeys?.includes(filters.uses)) &&
          (!filters.author || entry.author === filters.author)
      )
  const scored = candidates.map((entry, index) => ({
    entry,
    index,
    ...matchWords(read.words, entry.title, entry.searchText),
  }))
  const words = read.words.length
  const full = scored.filter((item) => item.matched === words)
  const isPartial = words > 0 && full.length === 0
  const ranked = (isPartial ? scored.filter((item) => item.matched > 0) : full)
    .sort(
      (a, b) =>
        b.matched - a.matched || b.weight - a.weight || a.index - b.index
    )
    .map((item) => item.entry)
  const results = ranked
    .slice(0, args.limit)
    .map((entry) => toRow(entry, origin))
  const lines = results.map(
    (row) => `- ${row.ref} — ${row.title}: ${row.summary}\n  ${row.url}`
  )
  const note = isPartial
    ? 'Nothing matched every word; these match some of them.\n'
    : ''
  const text =
    results.length === 0
      ? 'Nothing matched. Try fewer words, or drop a filter.'
      : `${note}${ranked.length} match${ranked.length === 1 ? '' : 'es'}${ranked.length > results.length ? `, first ${results.length}` : ''}:\n${lines.join('\n')}`
  return {
    content: [{ type: 'text', text }],
    structuredContent: { results, total: ranked.length, isPartial },
  }
}
