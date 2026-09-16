import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { publicQuery } from './shared/builders'
import { getMany } from './shared/reads'
import { companyDoc, toolCard, toolDoc } from './shared/validators'
import { CANDIDATE_CAP, runToolSearch } from './tools_search'

/**
 * Tool reads, including the one search entry point the site and (later) the
 * MCP `search` tool share. Every read is indexed and bounded.
 */

const MAX_LIST = 200

type ToolCard = {
  tool: Doc<'tools'>
  company: { key: string; name: string; logoUrl?: string }
}

/** Join each tool to its company: one point read per distinct company. */
async function toCards(
  ctx: QueryCtx,
  tools: ReadonlyArray<Doc<'tools'>>
): Promise<Array<ToolCard>> {
  const companies = await getMany(
    ctx,
    tools.map((tool) => tool.companyId)
  )
  const cards: Array<ToolCard> = []
  for (const tool of tools) {
    const company = companies.get(tool.companyId)
    if (company) {
      cards.push({
        tool,
        company: {
          key: company.key,
          name: company.name,
          ...(company.logo ? { logoUrl: company.logo.url } : {}),
        },
      })
    }
  }
  return cards
}

/** Newest published tools — the home page's "new tools" row. */
export const listNew = publicQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(toolCard),
  handler: async (ctx, args) => {
    const tools = await ctx.db
      .query('tools')
      .withIndex('by_status_published', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(Math.min(args.limit ?? 12, MAX_LIST))
    return await toCards(ctx, tools)
  },
})

/** A company's published tools, by the company's handle. */
export const listByCompany = publicQuery({
  args: { companyKey: v.string() },
  returns: v.array(toolDoc),
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_key', (q) => q.eq('key', args.companyKey))
      .unique()
    if (!company) {
      return []
    }
    return await ctx.db
      .query('tools')
      .withIndex('by_company', (q) =>
        q.eq('companyId', company._id).eq('status', 'published')
      )
      .take(MAX_LIST)
  },
})

/**
 * One tool by key, with its company and capability tags — what the tool page
 * header shows above the file. Deprecated stays visible; archived is hidden.
 */
export const getByKey = publicQuery({
  args: { key: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      tool: toolDoc,
      company: companyDoc,
      capabilities: v.array(v.object({ slug: v.string(), label: v.string() })),
    })
  ),
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query('tools')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()
    if (
      !tool ||
      (tool.status !== 'published' && tool.status !== 'deprecated')
    ) {
      return null
    }
    const company = await ctx.db.get(tool.companyId)
    if (!company) {
      return null
    }
    return { tool, company, capabilities: await capabilitiesOf(ctx, tool._id) }
  },
})

/** Capability tags attached to a tool, in label order. */
export async function capabilitiesOf(
  ctx: QueryCtx,
  toolId: Id<'tools'>
): Promise<Array<{ slug: string; label: string }>> {
  const taggings = await ctx.db
    .query('taggings')
    .withIndex('by_entity_tag', (q) => q.eq('entityId', toolId))
    .take(64)
  const tags = await getMany(
    ctx,
    taggings
      .filter((tagging) => tagging.namespace === 'capability')
      .map((tagging) => tagging.tagId)
  )
  return [...tags.values()]
    .filter((tag) => tag.status === 'active')
    .map((tag) => ({ slug: tag.slug, label: tag.label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/* ─────────────────────────────────── search ─────────────────────────────── */

/**
 * Search v1: the same words and chips as the site's URL; MCP `search` reuses
 * it. The plan lives in `tools_search.ts`.
 */
export const search = publicQuery({
  args: {
    q: v.string(),
    chips: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({ results: v.array(toolCard), chips: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const { tools, chips } = await runToolSearch(ctx, {
      q: args.q,
      chips: args.chips,
      limit: Math.min(args.limit ?? 24, CANDIDATE_CAP),
    })
    return { results: await toCards(ctx, tools), chips }
  },
})
