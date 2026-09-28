import { derivedTagKeys } from '@/lib/catalog/derived-tags'
import type { AccessType, Tag } from '@/lib/types/catalog'

/**
 * The projections: values that used to be database columns rewritten by a
 * job, now computed once per build from the source files. One writer each,
 * here, so nothing can drift from the facts it is derived from.
 */

/** "2026-09-16" → the UTC midnight it names, in ms. */
export function dateToMs(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00.000Z`)
}

/** "Find contacts" → "find-contacts": the step key the file refers to. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Distinct tool keys in first-use order — the `tools:` header line. */
export function distinctToolKeys(
  steps: ReadonlyArray<{ toolKey?: string }>
): Array<string> {
  return [
    ...new Set(
      steps.flatMap((step) =>
        step.toolKey === undefined ? [] : [step.toolKey]
      )
    ),
  ]
}

/* ────────────────────────────── computed tags ────────────────────────────── */
/* Every entity carries its full tag list, so every filter is one membership
 * test: a tool is found by its company's category, a workflow by its tools'
 * capabilities, without anyone writing those tags twice. */

/** A tool: its capability, its company's category, and one `has:*` per way in. */
export function toolTags(
  tool: { capability: string; access: ReadonlyArray<{ type: AccessType }> },
  companyCategory: string
): Array<string> {
  return [
    `capability:${tool.capability}`,
    `category:${companyCategory}`,
    ...derivedTagKeys(tool),
  ]
}

/** A company: its category, then the ways in and capabilities of its published tools. */
export function companyTags(
  category: string,
  tools: ReadonlyArray<{
    capability: string
    access: ReadonlyArray<{ type: AccessType }>
  }>
): Array<string> {
  return [
    ...new Set([
      `category:${category}`,
      ...tools.flatMap(derivedTagKeys),
      ...tools.map((tool) => `capability:${tool.capability}`),
    ]),
  ]
}

/**
 * A workflow: its authored motion and channel tags, its tools' capabilities,
 * and `has:<way>` when EVERY tool offers that way — so `has:mcp` finds the
 * workflows an agent can run over MCP alone.
 */
export function workflowTags(
  authored: ReadonlyArray<string>,
  tools: ReadonlyArray<{
    capability: string
    access: ReadonlyArray<{ type: AccessType }>
  }>
): Array<string> {
  const shared = tools.length
    ? derivedTagKeys(tools[0] ?? { access: [] }).filter((key) =>
        tools.every((tool) => derivedTagKeys(tool).includes(key))
      )
    : []
  return [
    ...new Set([
      ...authored,
      ...tools.map((tool) => `capability:${tool.capability}`),
      ...shared,
    ]),
  ]
}

/**
 * What search finds an entity by: its own words plus the label and synonyms
 * of every tag it carries — "enrichment" finds every tool that enriches, and
 * "mcp" every tool with an MCP way in.
 */
export function searchTextOf(
  words: ReadonlyArray<string | undefined>,
  tagKeys: ReadonlyArray<string>,
  tags: ReadonlyMap<string, Tag>
): string {
  return [
    ...words.filter((word): word is string => Boolean(word)),
    ...tagKeys.flatMap((key) => {
      const tag = tags.get(key)
      return tag ? [tag.label, ...tag.synonyms] : []
    }),
  ].join(' ')
}

const FIRST_SENTENCE = /^[^.!?]+[.!?]/

/**
 * A company in one line: its tagline, else its description's first sentence,
 * else "" — for lists that name companies (a tag's file, `/llms.txt`).
 */
export function companySummary(company: {
  tagline?: string
  description?: string
}): string {
  if (company.tagline) {
    return company.tagline
  }
  const text = company.description?.trim() ?? ''
  return (FIRST_SENTENCE.exec(text)?.[0] ?? text).trim()
}
