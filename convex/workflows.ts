import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { publicQuery } from './shared/builders'
import { getMany } from './shared/reads'
import {
  companyDoc,
  toolDoc,
  workflowDoc,
  workflowRow,
  workflowVersionDoc,
} from './shared/validators'

/**
 * Workflow reads. A growth hack is a one-tool workflow and uses every read
 * here with `format: 'hack'`. Every read is indexed and bounded.
 */

const MAX_LIST = 100

const sortValidator = v.union(
  v.literal('trending'),
  v.literal('top'),
  v.literal('new')
)
const formatValidator = v.union(v.literal('hack'), v.literal('workflow'))
/** The listing index behind each sort, with and without a format. */
const SORT_INDEX = {
  trending: 'by_trending',
  top: 'by_top',
  new: 'by_new',
} as const
const FORMAT_SORT_INDEX = {
  trending: 'by_format_trending',
  top: 'by_format_top',
  new: 'by_format_new',
} as const

type Row = {
  workflow: Doc<'workflows'>
  tools: Array<{
    key: string
    name: string
    companyKey: string
    logoUrl?: string
  }>
}

/**
 * Attach each workflow's tools (from the `workflowTools` projection): three
 * rounds of parallel point reads, deduplicated across the page.
 */
async function toRows(
  ctx: QueryCtx,
  workflows: ReadonlyArray<Doc<'workflows'>>
): Promise<Array<Row>> {
  const linksPerWorkflow = await Promise.all(
    workflows.map((workflow) =>
      ctx.db
        .query('workflowTools')
        .withIndex('by_workflow', (q) => q.eq('workflowId', workflow._id))
        .take(16)
    )
  )
  const tools = await getMany(
    ctx,
    linksPerWorkflow.flat().map((link) => link.toolId)
  )
  const companies = await getMany(
    ctx,
    [...tools.values()].map((tool) => tool.companyId)
  )
  return workflows.map((workflow, index) => ({
    workflow,
    tools: (linksPerWorkflow[index] ?? []).flatMap((link) => {
      const tool = tools.get(link.toolId)
      const company = tool ? companies.get(tool.companyId) : undefined
      if (!(tool && company)) {
        return []
      }
      return [
        {
          key: tool.key,
          name: tool.name,
          companyKey: company.key,
          ...(company.logo ? { logoUrl: company.logo.url } : {}),
        },
      ]
    }),
  }))
}

/** Trending, Top or New, optionally one format. Every combination reads its own index. */
export const list = publicQuery({
  args: {
    sort: sortValidator,
    format: v.optional(formatValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(workflowRow),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 30, MAX_LIST)
    const format = args.format
    const workflows = format
      ? await ctx.db
          .query('workflows')
          .withIndex(FORMAT_SORT_INDEX[args.sort], (q) =>
            q.eq('listed', true).eq('format', format)
          )
          .order('desc')
          .take(limit)
      : await ctx.db
          .query('workflows')
          .withIndex(SORT_INDEX[args.sort], (q) => q.eq('listed', true))
          .order('desc')
          .take(limit)
    return await toRows(ctx, workflows)
  },
})

const versionSummary = v.object({
  _id: v.id('workflowVersions'),
  version: v.number(),
  createdAt: v.number(),
  scanStatus: v.union(
    v.literal('pending'),
    v.literal('clean'),
    v.literal('flagged')
  ),
})

/**
 * One workflow by key, with the requested (or current) version, the tools its
 * steps use, and the version list. A `moderation: 'pending'` workflow is live
 * at its link and simply absent from lists; archived ones are hidden.
 */
export const getByKey = publicQuery({
  args: { key: v.string(), version: v.optional(v.number()) },
  returns: v.union(
    v.null(),
    v.object({
      workflow: workflowDoc,
      version: workflowVersionDoc,
      tools: v.array(v.object({ tool: toolDoc, company: companyDoc })),
      versions: v.array(versionSummary),
    })
  ),
  handler: async (ctx, args) => {
    const workflow = await ctx.db
      .query('workflows')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()
    if (
      !workflow ||
      (workflow.status !== 'published' && workflow.status !== 'deprecated') ||
      workflow.moderation === 'rejected'
    ) {
      return null
    }

    let version: Doc<'workflowVersions'> | null = null
    if (args.version !== undefined) {
      const pinned = args.version
      version = await ctx.db
        .query('workflowVersions')
        .withIndex('by_workflow', (q) =>
          q.eq('workflowId', workflow._id).eq('version', pinned)
        )
        .unique()
    } else if (workflow.currentVersionId) {
      version = await ctx.db.get(workflow.currentVersionId)
    }
    if (!version) {
      return null
    }

    const toolIds = [...new Set(version.steps.map((step) => step.toolId))]
    const toolsById = await getMany(ctx, toolIds)
    const companiesById = await getMany(
      ctx,
      [...toolsById.values()].map((tool) => tool.companyId)
    )
    const tools: Array<{ tool: Doc<'tools'>; company: Doc<'companies'> }> = []
    for (const toolId of toolIds) {
      const tool = toolsById.get(toolId)
      const company = tool ? companiesById.get(tool.companyId) : undefined
      if (tool && company) {
        tools.push({ tool, company })
      }
    }

    const versions = await ctx.db
      .query('workflowVersions')
      .withIndex('by_workflow', (q) => q.eq('workflowId', workflow._id))
      .order('desc')
      .take(50)

    return {
      workflow,
      version,
      tools,
      versions: versions.map((entry) => ({
        _id: entry._id,
        version: entry.version,
        createdAt: entry._creationTime,
        scanStatus: entry.scan.status,
      })),
    }
  },
})

/** Listed workflows using a tool, trending first. */
export const listByTool = publicQuery({
  args: { toolKey: v.string(), limit: v.optional(v.number()) },
  returns: v.array(workflowRow),
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query('tools')
      .withIndex('by_key', (q) => q.eq('key', args.toolKey))
      .unique()
    if (!tool) {
      return []
    }
    const links = await ctx.db
      .query('workflowTools')
      .withIndex('by_tool', (q) => q.eq('toolId', tool._id).eq('listed', true))
      .order('desc')
      .take(Math.min(args.limit ?? 20, MAX_LIST))
    const workflows = await Promise.all(
      links.map((link) => ctx.db.get(link.workflowId))
    )
    return await toRows(
      ctx,
      workflows.filter(
        (workflow): workflow is Doc<'workflows'> => workflow !== null
      )
    )
  },
})

/** Listed workflows using any of a company's tools, trending first. */
export const listByCompany = publicQuery({
  args: { companyKey: v.string(), limit: v.optional(v.number()) },
  returns: v.array(workflowRow),
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_key', (q) => q.eq('key', args.companyKey))
      .unique()
    if (!company) {
      return []
    }
    const links = await ctx.db
      .query('workflowTools')
      .withIndex('by_company', (q) =>
        q.eq('companyId', company._id).eq('listed', true)
      )
      .order('desc')
      .take(Math.min(args.limit ?? 20, MAX_LIST) * 2)
    const ids = [...new Set(links.map((link) => link.workflowId))]
    const workflows = await Promise.all(ids.map((id) => ctx.db.get(id)))
    return await toRows(
      ctx,
      workflows
        .filter((workflow): workflow is Doc<'workflows'> => workflow !== null)
        .slice(0, Math.min(args.limit ?? 20, MAX_LIST))
    )
  },
})

/** Full-text search over listed workflows, optionally one format. */
export const search = publicQuery({
  args: {
    q: v.string(),
    format: v.optional(formatValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(workflowRow),
  handler: async (ctx, args) => {
    const query = args.q.trim()
    if (!query) {
      return []
    }
    const format = args.format
    const workflows = await ctx.db
      .query('workflows')
      .withSearchIndex('search_workflows', (q) => {
        const base = q.search('searchText', query).eq('listed', true)
        return format ? base.eq('format', format) : base
      })
      .take(Math.min(args.limit ?? 30, MAX_LIST))
    return await toRows(ctx, workflows)
  },
})
