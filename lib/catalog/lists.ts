import { ACCESS_ORDER } from '@/lib/constants/catalog'
import type { Catalog } from '@/lib/content/build-catalog'
import type {
  AccessType,
  Category,
  Company,
  CompanyListItem,
  PaletteItem,
  TagChip,
  Tool,
  ToolListItem,
  Workflow,
  WorkflowListItem,
} from '@/lib/types/catalog'
import type {
  CompanySearchItem,
  ToolSearchItem,
  WorkflowSearchItem,
} from './search'

/**
 * List projections: what a row needs and nothing more, built from the
 * in-memory catalog.
 */

/** The distinct ways in, in setup order. */
function accessTypesOf(
  access: ReadonlyArray<{ type: AccessType }>
): Array<AccessType> {
  const types = new Set(access.map((entry) => entry.type))
  return ACCESS_ORDER.filter((type) => types.has(type))
}

function categoryOf(catalog: Catalog, company: Company): Category | undefined {
  const tag = catalog.tags.get(`category:${company.category}`)
  return tag ? { slug: tag.slug, label: tag.label } : undefined
}

/** The ways in across a company's published tools — a fact, not a badge. */
function companyAccess(catalog: Catalog, company: Company): Array<AccessType> {
  const tools = (catalog.toolsByCompany.get(company.key) ?? []).flatMap(
    (key) => {
      const tool = catalog.tools.get(key)
      return tool?.status === 'published' ? [tool] : []
    }
  )
  return accessTypesOf(tools.flatMap((tool) => tool.access))
}

export function toolListItem(catalog: Catalog, tool: Tool): ToolListItem {
  const company = catalog.companies.get(tool.companyKey)
  const category = company ? categoryOf(catalog, company) : undefined
  return {
    tool: {
      key: tool.key,
      name: tool.name,
      summary: tool.summary,
      agentLevel: tool.agentLevel,
      access: accessTypesOf(tool.access),
    },
    company: {
      key: tool.companyKey,
      name: company?.name ?? tool.companyKey,
      ...(company?.logo ? { logoUrl: company.logo.url } : {}),
    },
    ...(category ? { category } : {}),
  }
}

export function companyListItem(
  catalog: Catalog,
  company: Company,
  includeCategory = true
): CompanyListItem {
  const category = includeCategory ? categoryOf(catalog, company) : undefined
  return {
    company: {
      key: company.key,
      name: company.name,
      ...(company.tagline ? { tagline: company.tagline } : {}),
      ...(company.description ? { description: company.description } : {}),
      domain: company.domain,
      ...(company.logo ? { logoUrl: company.logo.url } : {}),
    },
    ...(category ? { category } : {}),
    access: companyAccess(catalog, company),
  }
}

export function workflowListItem(
  catalog: Catalog,
  workflow: Workflow
): WorkflowListItem {
  return {
    workflow: {
      key: workflow.key,
      title: workflow.title,
      summary: workflow.summary,
      author: workflow.author,
      toolCount: workflow.toolCount,
    },
    tools: workflow.toolKeys.flatMap((key) => {
      const tool = catalog.tools.get(key)
      const company = tool ? catalog.companies.get(tool.companyKey) : undefined
      if (!(tool && company)) {
        return []
      }
      return [
        {
          companyKey: company.key,
          companyName: company.name,
          ...(company.logo ? { logoUrl: company.logo.url } : {}),
          access: accessTypesOf(tool.access),
        },
      ]
    }),
  }
}

/* ─────────────────────────── search items ─────────────────────────── */
/* The list row plus what search needs; a listing ships these prerendered. */

export function toolSearchItem(catalog: Catalog, tool: Tool): ToolSearchItem {
  return {
    ...toolListItem(catalog, tool),
    capability: tool.capability,
    searchText: tool.searchText,
    updatedAt: tool.updatedAt,
  }
}

export function workflowSearchItem(
  catalog: Catalog,
  workflow: Workflow,
  featuredIndex: number
): WorkflowSearchItem {
  return {
    ...workflowListItem(catalog, workflow),
    tags: workflow.tags,
    searchText: workflow.searchText,
    updatedAt: workflow.updatedAt,
    featuredIndex,
  }
}

export function companySearchItem(
  catalog: Catalog,
  company: Company
): CompanySearchItem {
  return {
    ...companyListItem(catalog, company),
    searchText: company.searchText,
    updatedAt: company.updatedAt,
  }
}

export function tagChip(
  tag: Catalog['tags'] extends ReadonlyMap<string, infer T> ? T : never
): TagChip {
  return {
    key: tag.key,
    namespace: tag.namespace,
    slug: tag.slug,
    label: tag.label,
    counts: tag.counts,
  }
}

/* ────────────────────────────── palette items ───────────────────────────── */
/* The flattest row of all: what ⌘K draws. One shape across all three kinds. */

function toolPaletteItem(catalog: Catalog, tool: Tool): PaletteItem {
  const company = catalog.companies.get(tool.companyKey)
  return {
    kind: 'tool',
    key: tool.key,
    // A bare capability name ("Enrich contacts") is ambiguous across vendors.
    title: company ? `${company.name} · ${tool.name}` : tool.name,
    subtitle: tool.summary,
    href: `/tools/${tool.key}`,
    searchText: tool.searchText,
    updatedAt: tool.updatedAt,
  }
}

function workflowPaletteItem(workflow: Workflow): PaletteItem {
  return {
    kind: 'workflow',
    key: workflow.key,
    title: workflow.title,
    subtitle: workflow.summary,
    href: `/workflows/${workflow.key}`,
    searchText: workflow.searchText,
    updatedAt: workflow.updatedAt,
  }
}

function companyPaletteItem(company: Company): PaletteItem {
  return {
    kind: 'company',
    key: company.key,
    title: company.name,
    subtitle: company.tagline ?? company.description ?? company.domain,
    href: `/companies/${company.key}`,
    searchText: company.searchText,
    updatedAt: company.updatedAt,
  }
}

/**
 * The whole catalog, flat and in palette order: workflows lead because they
 * are the thing to run, then the newest tools, then the companies behind them.
 */
export function paletteItems(catalog: Catalog): Array<PaletteItem> {
  return [
    ...catalog.order.workflowsFeatured.flatMap((key) => {
      const workflow = catalog.workflows.get(key)
      return workflow ? [workflowPaletteItem(workflow)] : []
    }),
    ...catalog.order.toolsNew.flatMap((key) => {
      const tool = catalog.tools.get(key)
      return tool ? [toolPaletteItem(catalog, tool)] : []
    }),
    ...catalog.order.companies.flatMap((key) => {
      const company = catalog.companies.get(key)
      return company ? [companyPaletteItem(company)] : []
    }),
  ]
}
