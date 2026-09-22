import 'server-only'

import { getCatalog } from './catalog'
import { type EntityType, formatRef } from './keys'
import {
  companyListItem,
  companySearchItem,
  tagChip,
  toolListItem,
  toolSearchItem,
  workflowListItem,
  workflowSearchItem,
} from './lists'
import type {
  Company,
  EdgeGroup,
  MapNode,
  Tool,
  WorkflowListItem,
} from './types'

/**
 * The catalog's server-side loaders. Every page and route handler reads
 * through here (the discovery surfaces — sitemap, `/llms.txt` — through
 * ./discovery.ts); the bodies read the catalog built once per process from
 * the markdown tree (./catalog.ts).
 *
 * They stay `async` so call sites never change, and they resolve in a
 * microtask, which is what keeps every catalog route prerenderable under
 * Cache Components: no request-time data, no `connection()`, no cache tags.
 * There is nothing to revalidate — a deploy is the publish.
 */

const MAX_LIST = 200

/* ───────────────────────────────── per key ───────────────────────────────── */

/** Published or deprecated: reachable by key. Drafts never enter the catalog. */
export async function loadCompany(key: string): Promise<Company | null> {
  return getCatalog().companies.get(key) ?? null
}

export async function loadTool(key: string) {
  const catalog = getCatalog()
  const tool = catalog.tools.get(key)
  const company = tool ? catalog.companies.get(tool.companyKey) : undefined
  if (!(tool && company)) {
    return null
  }
  const capability = catalog.tags.get(`capability:${tool.capability}`)
  return {
    tool,
    company,
    capabilities: capability
      ? [{ slug: capability.slug, label: capability.label }]
      : [],
  }
}

/**
 * One workflow with its tools. v1 keeps the current version only: a pin on
 * any other version is a miss, and the page turns that into a 404.
 */
export async function loadWorkflow(key: string, version: number | undefined) {
  const catalog = getCatalog()
  const workflow = catalog.workflows.get(key)
  if (!workflow || (version !== undefined && version !== workflow.version)) {
    return null
  }
  const tools = workflow.toolKeys.flatMap((toolKey) => {
    const tool = catalog.tools.get(toolKey)
    const company = tool ? catalog.companies.get(tool.companyKey) : undefined
    return tool && company ? [{ tool, company }] : []
  })
  const updatedAt =
    catalog.documents.get(formatRef('workflow', key))?.updatedAt ??
    workflow.updatedAt
  return {
    workflow,
    version: { version: workflow.version, steps: workflow.steps, updatedAt },
    tools,
    /** The same tools as list rows, for the "Built from" section. */
    toolItems: tools.map(({ tool }) => toolListItem(catalog, tool)),
    tags: workflow.tags.flatMap((tagKey) => {
      const tag = catalog.tags.get(tagKey)
      return tag ? [{ key: tag.key, label: tag.label }] : []
    }),
  }
}

/** The rendered file for a ref (no version pin — the header carries it). */
export async function loadDocument(type: EntityType, key: string) {
  return getCatalog().documents.get(formatRef(type, key)) ?? null
}

/** A company's published tools, by key. */
export async function loadToolsByCompany(
  companyKey: string
): Promise<Array<Tool>> {
  const catalog = getCatalog()
  return (catalog.toolsByCompany.get(companyKey) ?? []).flatMap((key) => {
    const tool = catalog.tools.get(key)
    return tool?.status === 'published' ? [tool] : []
  })
}

function workflowRows(keys: ReadonlyArray<string>): Array<WorkflowListItem> {
  const catalog = getCatalog()
  return keys.flatMap((key) => {
    const workflow = catalog.workflows.get(key)
    return workflow ? [workflowListItem(catalog, workflow)] : []
  })
}

/** Published workflows using a tool, featured first. */
export async function loadWorkflowsByTool(toolKey: string) {
  return workflowRows(getCatalog().workflowsByTool.get(toolKey) ?? [])
}

/** Published workflows using any of a company's tools, featured first. */
export async function loadWorkflowsByCompany(companyKey: string) {
  return workflowRows(getCatalog().workflowsByCompany.get(companyKey) ?? [])
}

/** An old key → its current one, or null. */
export async function resolveAlias(entityType: EntityType, key: string) {
  const current = getCatalog().aliases.get(`${entityType}:${key}`)
  return current ? { key: current } : null
}

/* ─────────────────────────────────── the map ─────────────────────────────── */

function edgeGroup(
  relation: string,
  direction: 'out' | 'in',
  nodes: Array<MapNode>
): EdgeGroup {
  return { relation, direction, nodes, isTruncated: false }
}

function companyNode(company: Company): MapNode {
  return { type: 'company', key: company.key, name: company.name }
}

function tagNodes(keys: ReadonlyArray<string>): Array<MapNode> {
  const catalog = getCatalog()
  return keys.flatMap((key) => {
    const tag = catalog.tags.get(key)
    return tag ? [{ type: 'tag', key: tag.key, name: tag.label }] : []
  })
}

function toolNodes(keys: ReadonlyArray<string>): Array<MapNode> {
  const catalog = getCatalog()
  return keys.flatMap((key) => {
    const tool = catalog.tools.get(key)
    return tool ? [{ type: 'tool', key: tool.key, name: tool.name }] : []
  })
}

function workflowNodes(keys: ReadonlyArray<string>): Array<MapNode> {
  const catalog = getCatalog()
  return keys.flatMap((key) => {
    const workflow = catalog.workflows.get(key)
    return workflow
      ? [{ type: 'workflow', key: workflow.key, name: workflow.title }]
      : []
  })
}

/** The relationship map for one node: what it is, and every edge touching it. */
export async function loadNeighborhood(
  type: 'company' | 'tool' | 'workflow',
  key: string
): Promise<{ node: MapNode; groups: Array<EdgeGroup> } | null> {
  const catalog = getCatalog()
  if (type === 'company') {
    const company = catalog.companies.get(key)
    if (!company) {
      return null
    }
    return {
      node: companyNode(company),
      groups: [
        edgeGroup(
          'makes',
          'out',
          toolNodes(catalog.toolsByCompany.get(key) ?? [])
        ),
        edgeGroup('tagged', 'out', tagNodes([`category:${company.category}`])),
        edgeGroup(
          'its tools appear in',
          'in',
          workflowNodes(catalog.workflowsByCompany.get(key) ?? [])
        ),
      ],
    }
  }
  if (type === 'tool') {
    const tool = catalog.tools.get(key)
    if (!tool) {
      return null
    }
    const company = catalog.companies.get(tool.companyKey)
    return {
      node: { type: 'tool', key: tool.key, name: tool.name },
      groups: [
        edgeGroup('made by', 'out', company ? [companyNode(company)] : []),
        edgeGroup(
          'tagged',
          'out',
          tagNodes([`capability:${tool.capability}`, ...tool.tags])
        ),
        edgeGroup(
          'used by',
          'in',
          workflowNodes(catalog.workflowsByTool.get(key) ?? [])
        ),
      ],
    }
  }
  const workflow = catalog.workflows.get(key)
  if (!workflow) {
    return null
  }
  const companies = [
    ...new Set(
      workflow.toolKeys.flatMap((toolKey) => {
        const tool = catalog.tools.get(toolKey)
        return tool ? [tool.companyKey] : []
      })
    ),
  ].flatMap((companyKey) => {
    const company = catalog.companies.get(companyKey)
    return company ? [companyNode(company)] : []
  })
  return {
    node: { type: 'workflow', key: workflow.key, name: workflow.title },
    groups: [
      edgeGroup('uses', 'out', toolNodes(workflow.toolKeys)),
      edgeGroup('reaches', 'out', companies),
      edgeGroup('tagged', 'out', tagNodes(workflow.tags)),
      edgeGroup('versions', 'out', [
        {
          type: 'workflow',
          key: `${workflow.key}@${workflow.version}`,
          name: `v${workflow.version}`,
        },
      ]),
    ],
  }
}

/** The whole graph's shape plus every focusable node. */
export async function loadMapOverview() {
  const catalog = getCatalog()
  const tools = [...catalog.tools.values()]
  const workflows = [...catalog.workflows.values()]
  const nodes: Array<MapNode> = [
    ...[...catalog.companies.values()].map(companyNode),
    ...toolNodes(tools.map((tool) => tool.key)),
    ...workflowNodes(workflows.map((workflow) => workflow.key)),
  ]
  return {
    counts: {
      companies: catalog.companies.size,
      tools: tools.length,
      workflows: workflows.length,
      tags: catalog.tags.size,
      // Every tool has exactly one company, so the edge count IS the tool count.
      toolCompanyEdges: tools.length,
      workflowToolEdges: workflows.reduce(
        (sum, workflow) => sum + workflow.toolCount,
        0
      ),
      taggingEdges:
        catalog.companies.size +
        tools.reduce((sum, tool) => sum + 1 + tool.tags.length, 0) +
        workflows.reduce((sum, workflow) => sum + workflow.tags.length, 0),
      versionEdges: workflows.length,
      aliasEdges: catalog.aliases.size,
    },
    isTruncated: false,
    nodes,
  }
}

/* ─────────────────────────────────── lists ───────────────────────────────── */

/** Published companies in name order, optionally one category, with category and ways in. */
export async function loadCompanies(
  limit = MAX_LIST,
  category?: string,
  includeCategory = true
) {
  const catalog = getCatalog()
  if (category && !catalog.tags.has(`category:${category}`)) {
    return []
  }
  return catalog.order.companies
    .flatMap((key) => {
      const company = catalog.companies.get(key)
      return company && (!category || company.category === category)
        ? [company]
        : []
    })
    .slice(0, Math.min(limit, MAX_LIST))
    .map((company) => companyListItem(catalog, company, includeCategory))
}

/** Featured (editorial rank, then newest) or New, optionally within one tag. */
export async function loadWorkflows(
  sort: 'featured' | 'new',
  limit = 30,
  tag?: string
) {
  const catalog = getCatalog()
  if (tag && !catalog.tags.has(tag)) {
    return []
  }
  const order =
    sort === 'new'
      ? catalog.order.workflowsNew
      : catalog.order.workflowsFeatured
  return workflowRows(
    order.filter(
      (key) => !tag || catalog.workflows.get(key)?.tags.includes(tag)
    )
  ).slice(0, Math.min(limit, MAX_LIST))
}

/* ──────────────────────────── listing payloads ───────────────────────────── */
/* Every item of a kind, prerendered into the page; the browser filters them. */

/** Every published tool, newest first, with what search needs. */
export async function loadToolSearchItems() {
  const catalog = getCatalog()
  return catalog.order.toolsNew.flatMap((key) => {
    const tool = catalog.tools.get(key)
    return tool ? [toolSearchItem(catalog, tool)] : []
  })
}

/** Every published workflow in featured order, with what search needs. */
export async function loadWorkflowSearchItems() {
  const catalog = getCatalog()
  return catalog.order.workflowsFeatured.flatMap((key, index) => {
    const workflow = catalog.workflows.get(key)
    return workflow ? [workflowSearchItem(catalog, workflow, index)] : []
  })
}

/** Every published company in name order, with what search needs. */
export async function loadCompanySearchItems() {
  const catalog = getCatalog()
  return catalog.order.companies.flatMap((key) => {
    const company = catalog.companies.get(key)
    return company ? [companySearchItem(catalog, company)] : []
  })
}

/** Every tag as a filter chip, with its counts. */
export async function loadTagChips() {
  return [...getCatalog().tags.values()].map(tagChip)
}

/** The newest published tools, as list rows. */
export async function loadNewTools(limit = 12) {
  const catalog = getCatalog()
  return catalog.order.toolsNew.slice(0, limit).flatMap((key) => {
    const tool = catalog.tools.get(key)
    return tool ? [toolListItem(catalog, tool)] : []
  })
}
