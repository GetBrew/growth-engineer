import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import {
  DERIVED_TAG_NAMESPACES,
  TAG_NAMESPACES,
  type TagNamespace,
} from './model/keys'
import { getMany } from './shared/reads'

/**
 * The query plan behind `tools.search` — index-only and bounded. Not a Convex
 * function module: `tools.ts` owns the public entry point, this file owns
 * the two steps.
 *
 *   1. Candidates ≤ 60 from exactly one index: with words, `search_tools`
 *      (one agent level can ride along as a filter); with curated chips only,
 *      the most selective tag group through `taggings.by_tag_popular`
 *      (OR = union); derived chips only, `tools.by_agent_level`; nothing,
 *      the newest tools.
 *   2. Post-filter: `agent:` / `has:` from fields already on the row, then
 *      the remaining curated groups through `taggings.by_entity_tag` point
 *      reads (AND across groups, OR within).
 *
 * Recall is bounded by the candidate cap; a dedicated search engine takes
 * over when that stops being enough (docs/data-model.md § Scaling).
 */

export const CANDIDATE_CAP = 60
const MAX_CHIPS = 8

type AgentLevel = Doc<'tools'>['agentLevel']
type Chip = { namespace: TagNamespace; slug: string; key: string }
type ChipGroup = [TagNamespace, Array<Chip>]

type Candidates = {
  candidates: Array<Doc<'tools'>>
  consumedGroup: TagNamespace | null
}

type Plan = {
  words: string
  agentChips: ReadonlyArray<Chip>
  hasChips: ReadonlyArray<Chip>
  categoryChips: ReadonlyArray<Chip>
  curated: ReadonlyArray<ChipGroup>
  limit: number
}

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

/** Company ids carrying any requested category (OR within the namespace). */
async function companyIdsByCategory(
  ctx: QueryCtx,
  categoryChips: ReadonlyArray<Chip>
): Promise<Set<Id<'companies'>>> {
  const tags = await tagsByKey(ctx, categoryChips)
  const taggings = await Promise.all(
    tags.map((tag) =>
      ctx.db
        .query('taggings')
        .withIndex('by_tag_new', (q) =>
          q.eq('tagId', tag._id).eq('entityType', 'company').eq('listed', true)
        )
        .order('desc')
        .take(CANDIDATE_CAP)
    )
  )
  return new Set(
    taggings.flatMap((rows) =>
      rows.flatMap((row) =>
        row.entityType === 'company' ? [row.entityId] : []
      )
    )
  )
}

/** Category-only browsing starts from matching companies, then their tools. */
async function candidatesByCategory(
  ctx: QueryCtx,
  categoryChips: ReadonlyArray<Chip>
): Promise<Array<Doc<'tools'>>> {
  const companyIds = [...(await companyIdsByCategory(ctx, categoryChips))]
  const tools = await Promise.all(
    companyIds.map((companyId) =>
      ctx.db
        .query('tools')
        .withIndex('by_company', (q) =>
          q.eq('companyId', companyId).eq('status', 'published')
        )
        .take(CANDIDATE_CAP)
    )
  )
  return tools
    .flat()
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
    .slice(0, CANDIDATE_CAP)
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
  if (plan.categoryChips.length > 0) {
    return {
      candidates: await candidatesByCategory(ctx, plan.categoryChips),
      consumedGroup: 'category',
    }
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

/** Step 2a: `agent:` and `has:` chips, from fields already on the row. */
function keepByRow(
  tools: ReadonlyArray<Doc<'tools'>>,
  agentChips: ReadonlyArray<Chip>,
  hasChips: ReadonlyArray<Chip>
): Array<Doc<'tools'>> {
  const agentLevels = new Set(agentChips.map((chip) => chip.slug))
  const accessTypes = new Set(hasChips.map((chip) => chip.slug))
  return tools.filter(
    (tool) =>
      (agentLevels.size === 0 || agentLevels.has(tool.agentLevel)) &&
      (accessTypes.size === 0 ||
        tool.access.some((access) => accessTypes.has(access.type)))
  )
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
  return tools.filter((tool) =>
    keptPerGroup.every((kept) => kept.has(tool._id))
  )
}

/** The whole plan: words + chips → published tools (≤ limit) and the chips as understood. */
export async function runToolSearch(
  ctx: QueryCtx,
  input: { q: string; chips: ReadonlyArray<string>; limit: number }
): Promise<{ tools: Array<Doc<'tools'>>; chips: Array<string> }> {
  const chips = parseChips(input.chips)
  const groups = groupByNamespace(chips)
  const agentChips = groups.get('agent') ?? []
  const hasChips = groups.get('has') ?? []
  const categoryChips = groups.get('category') ?? []
  const curated = [...groups.entries()].filter(
    ([namespace]) =>
      namespace !== 'category' && !DERIVED_TAG_NAMESPACES.has(namespace)
  )
  const { candidates, consumedGroup } = await findCandidates(ctx, {
    words: input.q.trim(),
    agentChips,
    hasChips,
    categoryChips,
    curated,
    limit: input.limit,
  })
  const tagged = await keepTagged(
    ctx,
    keepByRow(candidates, agentChips, hasChips),
    curated.filter(([namespace]) => namespace !== consumedGroup)
  )
  const categoryCompanyIds =
    categoryChips.length > 0 && consumedGroup !== 'category'
      ? await companyIdsByCategory(ctx, categoryChips)
      : null
  const results = categoryCompanyIds
    ? tagged.filter((tool) => categoryCompanyIds.has(tool.companyId))
    : tagged
  return {
    tools: results.slice(0, input.limit),
    chips: chips.map((chip) => chip.key),
  }
}
