import { formatRef } from '@/lib/catalog/keys'
import type {
  Company,
  Relations,
  Tag,
  Tool,
  Workflow,
} from '@/lib/types/catalog'

/**
 * THE edges, written once. Every relation a page, a rendered file, search or
 * MCP `get` shows is read from this map — keyed by ref (`company:apollo`,
 * `tool:apollo/enrich-person`, `workflow:x`) or tag key (`capability:x`),
 * which never collide: entity types and tag namespaces are distinct words.
 *
 * Published entries only, in listing order (tools by key, workflows featured
 * first, companies by name), except what an entry names itself: a
 * workflow's own tools and a tool's own company, whatever their status.
 * Tag counts are the lengths of the tag's lists.
 */

type Inputs = {
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  tags: ReadonlyMap<string, Tag>
  order: {
    companies: ReadonlyArray<string>
    workflowsFeatured: ReadonlyArray<string>
  }
}

function keysOf<T extends { key: string }>(
  entities: Iterable<T>
): Array<string> {
  return [...entities].map((entity) => entity.key)
}

export function buildRelations(inputs: Inputs): Map<string, Relations> {
  const { companies, tools, workflows, tags, order } = inputs
  const publishedTools = [...tools.values()]
    .filter((tool) => tool.status === 'published')
    .sort((a, b) => a.key.localeCompare(b.key))
  const featured = order.workflowsFeatured.flatMap((key) => {
    const workflow = workflows.get(key)
    return workflow ? [workflow] : []
  })
  const listedCompanies = order.companies.flatMap((key) => {
    const company = companies.get(key)
    return company ? [company] : []
  })
  const companyOf = (toolKey: string) => tools.get(toolKey)?.companyKey
  const relations = new Map<string, Relations>()

  for (const company of companies.values()) {
    relations.set(formatRef('company', company.key), {
      companies: [],
      tools: keysOf(
        publishedTools.filter((tool) => tool.companyKey === company.key)
      ),
      workflows: keysOf(
        featured.filter((workflow) =>
          workflow.toolKeys.some((key) => companyOf(key) === company.key)
        )
      ),
      tags: company.tags,
    })
  }
  for (const tool of tools.values()) {
    relations.set(formatRef('tool', tool.key), {
      companies: [tool.companyKey],
      tools: [],
      workflows: keysOf(
        featured.filter((workflow) => workflow.toolKeys.includes(tool.key))
      ),
      tags: tool.tags,
    })
  }
  for (const workflow of workflows.values()) {
    relations.set(formatRef('workflow', workflow.key), {
      companies: [
        ...new Set(
          workflow.toolKeys.flatMap((key) => {
            const companyKey = companyOf(key)
            return companyKey ? [companyKey] : []
          })
        ),
      ],
      tools: workflow.toolKeys,
      workflows: [],
      tags: workflow.tags,
    })
  }
  for (const tag of tags.values()) {
    const members = {
      companies: keysOf(
        listedCompanies.filter((company) => company.tags.includes(tag.key))
      ),
      tools: keysOf(
        publishedTools.filter((tool) => tool.tags.includes(tag.key))
      ),
      workflows: keysOf(
        featured.filter((workflow) => workflow.tags.includes(tag.key))
      ),
    }
    tag.counts = {
      companies: members.companies.length,
      tools: members.tools.length,
      workflows: members.workflows.length,
    }
    relations.set(tag.key, { ...members, tags: [] })
  }
  return relations
}
