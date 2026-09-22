import type { Company, Tag, Tool, Workflow } from '@/lib/catalog/types'

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

/** What the search box can find a company by. */
export function companySearchText(
  company: { name: string; tagline?: string },
  category: Tag | undefined
): string {
  return [
    company.name,
    company.tagline ?? '',
    category?.label ?? '',
    ...(category?.synonyms ?? []),
  ].join(' ')
}

/** What the search box can find a tool by: its own words plus the capability vocabulary. */
export function toolSearchText(
  tool: { name: string; summary: string },
  companyName: string,
  capability: Tag | undefined
): string {
  return [
    tool.name,
    companyName,
    tool.summary,
    capability?.label ?? '',
    ...(capability?.synonyms ?? []),
  ].join(' ')
}

/** What the search box can find a workflow by. */
export function workflowSearchText(
  workflow: { title: string; summary: string; toolKeys: ReadonlyArray<string> },
  tags: ReadonlyArray<Tag>
): string {
  return [
    workflow.title,
    workflow.summary,
    ...workflow.toolKeys.map((key) => key.split('/')[1] ?? key),
    ...tags.flatMap((tag) => [tag.label, ...tag.synonyms]),
  ].join(' ')
}

/** Distinct tool keys in first-use order — the `tools:` header line. */
export function distinctToolKeys(
  steps: ReadonlyArray<{ toolKey: string }>
): Array<string> {
  return [...new Set(steps.map((step) => step.toolKey))]
}

/**
 * Tag counts: companies by category, tools by capability and derived tags,
 * workflows by their curated tags. Published entities only — a deprecated
 * listing is reachable by key but no longer counted in the chips.
 */
export function tagCounts(
  tags: ReadonlyMap<string, Tag>,
  companies: Iterable<Company>,
  tools: Iterable<Tool>,
  workflows: Iterable<Workflow>
): void {
  const bump = (key: string, field: keyof Tag['counts']) => {
    const tag = tags.get(key)
    if (tag) {
      tag.counts[field] += 1
    }
  }
  for (const company of companies) {
    if (company.status === 'published') {
      bump(`category:${company.category}`, 'companies')
    }
  }
  for (const tool of tools) {
    if (tool.status !== 'published') {
      continue
    }
    bump(`capability:${tool.capability}`, 'tools')
    for (const key of tool.tags) {
      bump(key, 'tools')
    }
  }
  for (const workflow of workflows) {
    if (workflow.status !== 'published') {
      continue
    }
    for (const key of workflow.tags) {
      bump(key, 'workflows')
    }
  }
}
