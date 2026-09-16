import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import {
  DERIVED_TAG_NAMESPACES,
  TAG_NAMESPACES,
  type TagNamespace,
} from './model/keys'
import { publicQuery } from './shared/builders'
import { getMany } from './shared/reads'
import { companyDoc, toolCard, toolDoc } from './shared/validators'

/**
 * Tool reads, including the one search entry point the site and (later) the
 * MCP `search` tool share. Every read is indexed and bounded.
 */

const MAX_LIST = 200
const CANDIDATE_CAP = 60
const MAX_CHIPS = 8

type AgentLevel = Doc<'tools'>['agentLevel']

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

type Chip = { namespace: TagNamespace; slug: string; key: string }
type ChipGroup = [TagNamespace, Array<Chip>]

/** `capability:enrich-contacts` → chip; anything else is dropped. */
function parseChips(raw: ReadonlyArray<string>): Array<Chip> {
  const chips: Array<Chip> = []
  for (const value of raw.slice(0, MAX_CHIPS)) {
    const [namespace, slug, ...rest] = value.toLowerCase().split(':')
    if (!(namespace && slug) || rest.length > 0) {
      continue
    }
    if (!(TAG_NAMESPACES as ReadonlyArray<string>).includes(namespace)) {
      continue
    }
    chips.push({
      namespace: namespace as TagNamespace,
      slug,
      key: `${namespace}:${slug}`,
    })
  }
  return chips
}

function groupByNamespace(
  chips: ReadonlyArray<Chip>
): Map<TagNamespace, Array<Chip>> {
  const groups = new Map<TagNamespace, Array<Chip>>()
  for (const chip of chips) {
    groups.set(chip.namespace, [...(groups.get(chip.namespace) ?? []), chip])
  }
  return groups
}

/** The tag rows behind a group's chips; an unknown key is simply absent. */
async function tagsByKey(
  ctx: QueryCtx,
  chips: ReadonlyArray<Chip>
): Promise<Array<Doc<'tags'>>> {
  const tags = await Promise.all(
    chips.map((chip) =>
      ctx.db
        .query('tags')
        .withIndex('by_key', (q) => q.eq('key', chip.key))
        .unique()
    )
  )
  return tags.filter((tag): tag is Doc<'tags'> => tag !== null)
}

type Candidates = {
  candidates: Array<Doc<'tools'>>
  consumedGroup: TagNamespace | null
}

/** Words: the search index, with one agent level riding along as a filter. */
async function candidatesByWords(
  ctx: QueryCtx,
  words: string,
  agentChips: ReadonlyArray<Chip>
): Promise<Array<Doc<'tools'>>> {
  const singleLevel =
    agentChips.length === 1
      ? (agentChips[0]?.slug as AgentLevel | undefined)
      : undefined
  return await ctx.db
    .query('tools')
    .withSearchIndex('search_tools', (q) => {
      const base = q.search('searchText', words).eq('status', 'published')
      return singleLevel ? base.eq('agentLevel', singleLevel) : base
    })
    .take(CANDIDATE_CAP)
}

/** Curated chips only: the most selective group (fewest tagged tools), OR within it. */
async function candidatesByTags(
  ctx: QueryCtx,
  curated: ReadonlyArray<ChipGroup>
): Promise<Candidates> {
  const scored = await Promise.all(
    curated.map(async ([namespace, groupChips]) => {
      const tags = await tagsByKey(ctx, groupChips)
      return {
        namespace,
        tags,
        count: tags.reduce((sum, tag) => sum + tag.counts.tools, 0),
      }
    })
  )
  const start = scored.sort((a, b) => a.count - b.count)[0]
  if (!start) {
    return { candidates: [], consumedGroup: null }
  }
  const perTag = await Promise.all(
    start.tags.map((tag) =>
      ctx.db
        .query('taggings')
        .withIndex('by_tag_popular', (q) =>
          q.eq('tagId', tag._id).eq('entityType', 'tool').eq('listed', true)
        )
        .order('desc')
        .take(CANDIDATE_CAP)
    )
  )
  const ids: Array<Id<'tools'>> = []
  for (const tagging of perTag.flat()) {
    if (tagging.entityType === 'tool') {
      ids.push(tagging.entityId)
    }
  }
  const tools = await getMany(ctx, ids)
  return {
    candidates: [...tools.values()].filter(
      (tool) => tool.status === 'published'
    ),
    consumedGroup: start.namespace,
  }
}

async function candidatesByLevel(
  ctx: QueryCtx,
  level: AgentLevel
): Promise<Array<Doc<'tools'>>> {
  return await ctx.db
    .query('tools')
    .withIndex('by_agent_level', (q) =>
      q.eq('status', 'published').eq('agentLevel', level)
    )
    .order('desc')
    .take(CANDIDATE_CAP)
}

async function newestTools(
  ctx: QueryCtx,
  take: number
): Promise<Array<Doc<'tools'>>> {
  return await ctx.db
    .query('tools')
    .withIndex('by_status_published', (q) => q.eq('status', 'published'))
    .order('desc')
    .take(take)
}

type Plan = {
  words: string
  agentChips: ReadonlyArray<Chip>
  hasChips: ReadonlyArray<Chip>
  curated: ReadonlyArray<ChipGroup>
  limit: number
}

/** Step 1: candidates, ≤ 60, from exactly one index. */
async function findCandidates(ctx: QueryCtx, plan: Plan): Promise<Candidates> {
  if (plan.words) {
    return {
      candidates: await candidatesByWords(ctx, plan.words, plan.agentChips),
      consumedGroup: null,
    }
  }
  if (plan.curated.length > 0) {
    return await candidatesByTags(ctx, plan.curated)
  }
  const level =
    plan.agentChips.length === 1 ? plan.agentChips[0]?.slug : undefined
  if (level) {
    return {
      candidates: await candidatesByLevel(ctx, level as AgentLevel),
      consumedGroup: null,
    }
  }
  const derived = plan.agentChips.length > 0 || plan.hasChips.length > 0
  return {
    candidates: await newestTools(ctx, derived ? CANDIDATE_CAP : plan.limit),
    consumedGroup: null,
  }
}

async function hasAnyTag(
  ctx: QueryCtx,
  toolId: Id<'tools'>,
  tags: ReadonlyArray<Doc<'tags'>>
): Promise<boolean> {
  const taggings = await Promise.all(
    tags.map((tag) =>
      ctx.db
        .query('taggings')
        .withIndex('by_entity_tag', (q) =>
          q.eq('entityId', toolId).eq('tagId', tag._id)
        )
        .unique()
    )
  )
  return taggings.some((tagging) => tagging !== null)
}

/** Step 2b: AND across the remaining curated groups, OR within each — point reads, ≤ 60 × 8. */
async function keepTagged(
  ctx: QueryCtx,
  tools: ReadonlyArray<Doc<'tools'>>,
  groups: ReadonlyArray<ChipGroup>
): Promise<Array<Doc<'tools'>>> {
  if (groups.length === 0 || tools.length === 0) {
    return [...tools]
  }
  const keptPerGroup = await Promise.all(
    groups.map(async ([, groupChips]) => {
      const tags = await tagsByKey(ctx, groupChips)
      const matches = await Promise.all(
        tools.map((tool) => hasAnyTag(ctx, tool._id, tags))
      )
      return new Set(
        tools.filter((_, index) => matches[index]).map((tool) => tool._id)
      )
    })
  )
  return tools.filter((tool) => keptPerGroup.every((kept) => kept.has(tool._id)))
}

/**
 * Search v1. The same words and chips as the site's URL; MCP `search` reuses it.
 *
 * Plan (index-only, bounded):
 *   1. Candidates ≤ 60: with words, the `search_tools` index (one agent level
 *      can ride along as a filter); with curated chips only, the most
 *      selective tag group through `taggings.by_tag_popular` (OR = union);
 *      derived chips only, `tools.by_agent_level`; nothing, the newest tools.
 *   2. Post-filter in memory from fields already on the row (`agentLevel`,
 *      `access[].type`), then the remaining curated groups through
 *      `taggings.by_entity_tag` point reads (AND across groups, OR within).
 * Recall is bounded by the candidate cap; a dedicated search engine takes over
 * when that stops being enough (docs/data-model.md § Scaling).
 */
export const search = publicQuery({
  args: {
    q: v.string(),
    chips: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({ results: v.array(toolCard), chips: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 24, CANDIDATE_CAP)
    const chips = parseChips(args.chips)
    const groups = groupByNamespace(chips)
    const agentChips = groups.get('agent') ?? []
    const hasChips = groups.get('has') ?? []
    const curated = [...groups.entries()].filter(
      ([namespace]) => !DERIVED_TAG_NAMESPACES.has(namespace)
    )

    const { candidates, consumedGroup } = await findCandidates(ctx, {
      words: args.q.trim(),
      agentChips,
      hasChips,
      curated,
      limit,
    })

    // 2. Post-filter from fields already on the row, then the other groups.
    const agentLevels = new Set(agentChips.map((chip) => chip.slug))
    const accessTypes = new Set(hasChips.map((chip) => chip.slug))
    const onRow = candidates.filter(
      (tool) =>
        (agentLevels.size === 0 || agentLevels.has(tool.agentLevel)) &&
        (accessTypes.size === 0 ||
          tool.access.some((access) => accessTypes.has(access.type)))
    )
    const results = await keepTagged(
      ctx,
      onRow,
      curated.filter(([namespace]) => namespace !== consumedGroup)
    )

    return {
      results: await toCards(ctx, results.slice(0, limit)),
      chips: chips.map((chip) => chip.key),
    }
  },
})
