import { type EntityType, formatRef } from '@/lib/catalog/keys'
import { relationsOf } from '@/lib/catalog/relations'
import type { Catalog } from '@/lib/content/build-catalog'

/**
 * What MCP `search` looks through: every listed company, tool and workflow,
 * flattened once per catalog, in browse order — workflows featured first
 * (they are the thing to run), then tools newest first, then companies by
 * name. Each entry carries the facts every filter needs, so a filter is a
 * membership test and nothing is looked up per call.
 */

export type Entry = {
  kind: EntityType
  key: string
  ref: string
  /** A tool reads "Company · Name": a bare capability name is ambiguous. */
  title: string
  summary: string
  searchText: string
  tags: ReadonlyArray<string>
  /** Tool rows: the maker's handle. */
  company?: string
  /** Workflow rows: the author's GitHub login. */
  author?: string
  /** Workflow rows: the tools it uses, and their makers. */
  toolKeys?: ReadonlyArray<string>
  companies?: ReadonlyArray<string>
}

const cache = new WeakMap<Catalog, ReadonlyArray<Entry>>()

function build(catalog: Catalog): Array<Entry> {
  const workflows = catalog.order.workflowsFeatured.flatMap((key) => {
    const workflow = catalog.workflows.get(key)
    return workflow
      ? [
          {
            kind: 'workflow' as const,
            key,
            ref: formatRef('workflow', key),
            title: workflow.title,
            summary: workflow.summary,
            searchText: workflow.searchText,
            tags: workflow.tags,
            author: workflow.author,
            toolKeys: workflow.toolKeys,
            companies: relationsOf(catalog, formatRef('workflow', key))
              .companies,
          },
        ]
      : []
  })
  const tools = catalog.order.toolsNew.flatMap((key) => {
    const tool = catalog.tools.get(key)
    const company = tool ? catalog.companies.get(tool.companyKey) : undefined
    return tool && company
      ? [
          {
            kind: 'tool' as const,
            key,
            ref: formatRef('tool', key),
            title: `${company.name} · ${tool.name}`,
            summary: tool.summary,
            searchText: tool.searchText,
            tags: tool.tags,
            company: tool.companyKey,
          },
        ]
      : []
  })
  const companies = catalog.order.companies.flatMap((key) => {
    const company = catalog.companies.get(key)
    return company
      ? [
          {
            kind: 'company' as const,
            key,
            ref: formatRef('company', key),
            title: company.name,
            summary: company.tagline ?? company.description ?? company.domain,
            searchText: company.searchText,
            tags: company.tags,
          },
        ]
      : []
  })
  return [...workflows, ...tools, ...companies]
}

export function mcpEntries(catalog: Catalog): ReadonlyArray<Entry> {
  let entries = cache.get(catalog)
  if (!entries) {
    entries = build(catalog)
    cache.set(catalog, entries)
  }
  return entries
}
