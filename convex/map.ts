import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { publicQuery } from './shared/builders'
import { getMany } from './shared/reads'

/**
 * The relationship map: the catalog's graph, read-only.
 *
 * Everything here is already public on a page somewhere — this module answers
 * the one question the catalog pages do not: what is connected to what. It is
 * the view the Convex dashboard cannot give you, because the dashboard shows
 * rows and this shows EDGES.
 *
 * TWO READ SHAPES, and the difference matters:
 *
 *   `neighborhood`  INDEXED and bounded. One node, its edges, every read
 *                   through an index and every join a parallel point read.
 *                   This is the one you click through, so it stays cheap at
 *                   any catalog size.
 *   `overview`      BOUNDED SCANS. Counting a whole table has no index to
 *                   use, so each count stops at `SCAN_CAP` and the result
 *                   says `isTruncated` rather than lying with a smaller
 *                   number. At catalog scale this is exact; past the cap it
 *                   becomes "at least", and the number belongs in
 *                   `entityStats` instead.
 */

/** Per-relation ceiling on the neighborhood view. */
const EDGE_CAP = 200

/** Where the overview's counting stops. See the note above. */
const SCAN_CAP = 1000

/** How many nodes of each type the overview offers as focus targets. */
const INDEX_CAP = 250

const nodeType = v.union(
  v.literal('company'),
  v.literal('tool'),
  v.literal('workflow'),
  v.literal('tag')
)

/**
 * A node, reduced to what a map draws: what it is, its permanent key, and a
 * label. No href — the route grammar lives in `model/keys.ts` and the tag
 * filter grammar in `lib/catalog/query.ts`, so the UI builds links and this
 * module stays ignorant of routing.
 */
const mapNode = v.object({
  type: nodeType,
  key: v.string(),
  name: v.string(),
})

type MapNode = {
  type: 'company' | 'tool' | 'workflow' | 'tag'
  key: string
  name: string
}

const edgeGroup = v.object({
  /** Reads as a sentence from the focused node: "Clay" — makes → "Clay". */
  relation: v.string(),
  /** `out` = this node points at them; `in` = they point at this node. */
  direction: v.union(v.literal('out'), v.literal('in')),
  nodes: v.array(mapNode),
  isTruncated: v.boolean(),
})

type EdgeGroup = {
  relation: string
  direction: 'out' | 'in'
  nodes: Array<MapNode>
  isTruncated: boolean
}

function companyNode(company: Doc<'companies'>): MapNode {
  return { type: 'company', key: company.key, name: company.name }
}

function toolNode(tool: Doc<'tools'>): MapNode {
  return { type: 'tool', key: tool.key, name: tool.name }
}

function workflowNode(workflow: Doc<'workflows'>): MapNode {
  return { type: 'workflow', key: workflow.key, name: workflow.title }
}

function tagNode(tag: Doc<'tags'>): MapNode {
  return { type: 'tag', key: tag.key, name: tag.label }
}

function group(
  relation: string,
  direction: 'out' | 'in',
  nodes: Array<MapNode>
): EdgeGroup {
  return {
    relation,
    direction,
    nodes,
    isTruncated: nodes.length >= EDGE_CAP,
  }
}

/** The tags on one entity, through `by_entity_tag` then one round of point reads. */
async function tagsOf(
  ctx: QueryCtx,
  entityId: Id<'companies'> | Id<'tools'> | Id<'workflows'>
): Promise<Array<MapNode>> {
  const taggings = await ctx.db
    .query('taggings')
    .withIndex('by_entity_tag', (q) => q.eq('entityId', entityId))
    .take(EDGE_CAP)
  const tags = await getMany(
    ctx,
    taggings.map((tagging) => tagging.tagId)
  )
  return [...tags.values()].map(tagNode)
}

async function companyEdges(
  ctx: QueryCtx,
  company: Doc<'companies'>
): Promise<Array<EdgeGroup>> {
  const [tools, workflowLinks, tags] = await Promise.all([
    ctx.db
      .query('tools')
      .withIndex('by_company', (q) => q.eq('companyId', company._id))
      .take(EDGE_CAP),
    ctx.db
      .query('workflowTools')
      .withIndex('by_company', (q) => q.eq('companyId', company._id))
      .take(EDGE_CAP),
    tagsOf(ctx, company._id),
  ])
  const workflows = await getMany(
    ctx,
    workflowLinks.map((link) => link.workflowId)
  )
  return [
    group('makes', 'out', tools.map(toolNode)),
    group('tagged', 'out', tags),
    group(
      'its tools appear in',
      'in',
      [...workflows.values()].map(workflowNode)
    ),
  ]
}

async function toolEdges(
  ctx: QueryCtx,
  tool: Doc<'tools'>
): Promise<Array<EdgeGroup>> {
  const [company, workflowLinks, tags] = await Promise.all([
    ctx.db.get(tool.companyId),
    ctx.db
      .query('workflowTools')
      .withIndex('by_tool', (q) => q.eq('toolId', tool._id))
      .take(EDGE_CAP),
    tagsOf(ctx, tool._id),
  ])
  const workflows = await getMany(
    ctx,
    workflowLinks.map((link) => link.workflowId)
  )
  return [
    group('made by', 'out', company ? [companyNode(company)] : []),
    group('tagged', 'out', tags),
    group('used by', 'in', [...workflows.values()].map(workflowNode)),
  ]
}

async function workflowEdges(
  ctx: QueryCtx,
  workflow: Doc<'workflows'>
): Promise<Array<EdgeGroup>> {
  const [toolLinks, versions, tags] = await Promise.all([
    ctx.db
      .query('workflowTools')
      .withIndex('by_workflow', (q) => q.eq('workflowId', workflow._id))
      .take(EDGE_CAP),
    ctx.db
      .query('workflowVersions')
      .withIndex('by_workflow', (q) => q.eq('workflowId', workflow._id))
      .take(EDGE_CAP),
    tagsOf(ctx, workflow._id),
  ])
  const [tools, companies] = await Promise.all([
    getMany(
      ctx,
      toolLinks.map((link) => link.toolId)
    ),
    getMany(
      ctx,
      toolLinks.map((link) => link.companyId)
    ),
  ])
  return [
    group('uses', 'out', [...tools.values()].map(toolNode)),
    group('reaches', 'out', [...companies.values()].map(companyNode)),
    group('tagged', 'out', tags),
    group(
      'versions',
      'out',
      versions.map((version) => ({
        type: 'workflow' as const,
        key: `${workflow.key}@${version.version}`,
        name: `v${version.version}`,
      }))
    ),
  ]
}

/**
 * One node and everything touching it. `null` when the key names nothing —
 * the page turns that into a 404 rather than an empty graph.
 */
export const neighborhood = publicQuery({
  args: {
    type: v.union(
      v.literal('company'),
      v.literal('tool'),
      v.literal('workflow')
    ),
    key: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({ node: mapNode, groups: v.array(edgeGroup) })
  ),
  handler: async (ctx, args) => {
    switch (args.type) {
      case 'company': {
        const company = await ctx.db
          .query('companies')
          .withIndex('by_key', (q) => q.eq('key', args.key))
          .unique()
        return company
          ? {
              node: companyNode(company),
              groups: await companyEdges(ctx, company),
            }
          : null
      }
      case 'tool': {
        const tool = await ctx.db
          .query('tools')
          .withIndex('by_key', (q) => q.eq('key', args.key))
          .unique()
        return tool
          ? { node: toolNode(tool), groups: await toolEdges(ctx, tool) }
          : null
      }
      case 'workflow': {
        const workflow = await ctx.db
          .query('workflows')
          .withIndex('by_key', (q) => q.eq('key', args.key))
          .unique()
        return workflow
          ? {
              node: workflowNode(workflow),
              groups: await workflowEdges(ctx, workflow),
            }
          : null
      }
      default:
        return null
    }
  },
})

/** The shape of the whole graph, plus every node you can focus. */
export const overview = publicQuery({
  args: {},
  returns: v.object({
    counts: v.object({
      companies: v.number(),
      tools: v.number(),
      workflows: v.number(),
      tags: v.number(),
      toolCompanyEdges: v.number(),
      workflowToolEdges: v.number(),
      taggingEdges: v.number(),
      versionEdges: v.number(),
      aliasEdges: v.number(),
    }),
    isTruncated: v.boolean(),
    nodes: v.array(mapNode),
  }),
  handler: async (ctx) => {
    const [
      companies,
      tools,
      workflows,
      tags,
      workflowTools,
      taggings,
      versions,
      aliases,
    ] = await Promise.all([
      ctx.db.query('companies').take(SCAN_CAP),
      ctx.db.query('tools').take(SCAN_CAP),
      ctx.db.query('workflows').take(SCAN_CAP),
      ctx.db.query('tags').take(SCAN_CAP),
      ctx.db.query('workflowTools').take(SCAN_CAP),
      ctx.db.query('taggings').take(SCAN_CAP),
      ctx.db.query('workflowVersions').take(SCAN_CAP),
      ctx.db.query('keyAliases').take(SCAN_CAP),
    ])

    const scans = [
      companies,
      tools,
      workflows,
      tags,
      workflowTools,
      taggings,
      versions,
      aliases,
    ]

    return {
      counts: {
        companies: companies.length,
        tools: tools.length,
        workflows: workflows.length,
        tags: tags.length,
        // Every tool carries exactly one companyId, so the edge count IS the
        // tool count. Stated rather than recomputed, so a schema change that
        // makes it many-to-many shows up here as a lie.
        toolCompanyEdges: tools.length,
        workflowToolEdges: workflowTools.length,
        taggingEdges: taggings.length,
        versionEdges: versions.length,
        aliasEdges: aliases.length,
      },
      isTruncated: scans.some((rows) => rows.length >= SCAN_CAP),
      nodes: [
        ...companies.slice(0, INDEX_CAP).map(companyNode),
        ...tools.slice(0, INDEX_CAP).map(toolNode),
        ...workflows.slice(0, INDEX_CAP).map(workflowNode),
      ],
    }
  },
})
