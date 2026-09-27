import 'server-only'

import type {
  Company,
  PaletteItem,
  Tool,
  WorkflowListItem,
} from '@/lib/types/catalog'
import { getCatalog, getSourceFile } from './catalog'
import { type EntityType, formatRef } from './keys'
import {
  companyListItem,
  companySearchItem,
  paletteItems,
  tagChip,
  toolListItem,
  toolSearchItem,
  workflowListItem,
  workflowSearchItem,
} from './lists'
import { relationsOf } from './relations'
import { type Excerpt, sourceExcerpt } from './source-excerpt'

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

/** One workflow with its tools, and the date of its rendered file. */
export async function loadWorkflow(key: string) {
  const catalog = getCatalog()
  const workflow = catalog.workflows.get(key)
  if (!workflow) {
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
    updatedAt,
    tools,
    tags: workflow.tags.flatMap((tagKey) => {
      const tag = catalog.tags.get(tagKey)
      return tag ? [{ key: tag.key, label: tag.label }] : []
    }),
  }
}

/** The rendered file for a ref. */
export async function loadDocument(type: EntityType, key: string) {
  return getCatalog().documents.get(formatRef(type, key)) ?? null
}

/** A tag's rendered file: `capability:enrich-contacts`. */
export async function loadTagDocument(key: string) {
  return getCatalog().tagDocuments.get(key) ?? null
}

/** A company's published tools, by key. */
export async function loadToolsByCompany(
  companyKey: string
): Promise<Array<Tool>> {
  const catalog = getCatalog()
  return relationsOf(catalog, formatRef('company', companyKey)).tools.flatMap(
    (key) => {
      const tool = catalog.tools.get(key)
      return tool ? [tool] : []
    }
  )
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
  return workflowRows(
    relationsOf(getCatalog(), formatRef('tool', toolKey)).workflows
  )
}

/** Published workflows using any of a company's tools, featured first. */
export async function loadWorkflowsByCompany(companyKey: string) {
  return workflowRows(
    relationsOf(getCatalog(), formatRef('company', companyKey)).workflows
  )
}

/** An old key → its current one, or null. */
export async function resolveAlias(entityType: EntityType, key: string) {
  const current = getCatalog().aliases.get(`${entityType}:${key}`)
  return current ? { key: current } : null
}

/* ─────────────────────────────────── lists ───────────────────────────────── */

/** Published companies in name order, as rows without their category. */
export async function loadCompanies(limit = MAX_LIST) {
  const catalog = getCatalog()
  return catalog.order.companies
    .slice(0, Math.min(limit, MAX_LIST))
    .flatMap((key) => {
      const company = catalog.companies.get(key)
      return company ? [companyListItem(catalog, company, false)] : []
    })
}

/** Featured (editorial rank, then newest) or New. */
export async function loadWorkflows(sort: 'featured' | 'new', limit = 30) {
  const catalog = getCatalog()
  const order =
    sort === 'new'
      ? catalog.order.workflowsNew
      : catalog.order.workflowsFeatured
  return workflowRows(order.slice(0, Math.min(limit, MAX_LIST)))
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

/**
 * The ⌘K index: every company, tool and workflow in one flat list,
 * prerendered into every page with the site chrome — the palette never
 * fetches, and every keystroke is answered in the browser.
 */
export async function loadPaletteItems(): Promise<Array<PaletteItem>> {
  return paletteItems(getCatalog())
}

/**
 * A quote from a source file in the repository, for the contribute guides:
 * the file as written, or its header, or one `## ` section. Throws when the
 * file or the section is missing, so a guide can never show a sample that
 * drifted from the catalog — the build fails instead.
 */
export async function loadSourceExcerpt(
  path: string,
  excerpt?: Excerpt,
  omit?: ReadonlyArray<string>
): Promise<string> {
  const source = getSourceFile(path)
  if (source === undefined) {
    throw new Error(`${path} is not a file in the content tree`)
  }
  return sourceExcerpt(path, source, excerpt, omit)
}
