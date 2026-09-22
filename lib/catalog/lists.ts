import type { Catalog } from '@/lib/content/build-catalog'
import type {
  AccessType,
  Category,
  Company,
  CompanyListItem,
  Tool,
  ToolListItem,
  Workflow,
  WorkflowListItem,
} from './types'

/**
 * List projections: what a row needs and nothing more, built from the
 * in-memory catalog.
 */

const ACCESS_ORDER: ReadonlyArray<AccessType> = ['mcp', 'cli', 'api']

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
