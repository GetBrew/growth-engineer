import { v } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import { internalMutation, type MutationCtx } from '../_generated/server'
import { renderAndStoreDocument } from '../documents_render'
import { computeAgentLevel } from '../model/agent_level'
import { SEED_COMPANIES } from './companies'
import { DERIVED_TAGS, SEED_TAGS, type SeedTag } from './tags'
import { SEED_TOOLS } from './tools'
import { SEED_WORKFLOWS } from './workflows'

/**
 * Seed the catalog. Idempotent: every row is upserted by its key, so running
 * it twice is a no-op and running it after editing the seed files applies
 * the edits. Documents are re-rendered through the one render path and only
 * rewritten when their hash changed.
 *
 *   npx convex run seed/run:run
 *   npx convex run seed/run:reset      # bounded; repeat until `remaining` is 0
 *
 * Everything runs in ONE mutation (a few hundred writes, well inside the
 * 16,000-document / 1-second budget). Internal, never public.
 */

type Counters = Map<
  Id<'tags'>,
  { companies: number; tools: number; workflows: number }
>
type Entity =
  | { type: 'company'; id: Id<'companies'> }
  | { type: 'tool'; id: Id<'tools'> }
  | { type: 'workflow'; id: Id<'workflows'> }

async function upsertTag(
  ctx: MutationCtx,
  seed: SeedTag,
  derived: boolean
): Promise<Doc<'tags'>> {
  const key = `${seed.namespace}:${seed.slug}`
  const fields = {
    key,
    namespace: seed.namespace,
    slug: seed.slug,
    label: seed.label,
    synonyms: [...seed.synonyms],
    description: seed.description,
    derived,
    status: 'active' as const,
    searchText: [seed.label, ...seed.synonyms].join(' '),
  }
  const existing = await ctx.db
    .query('tags')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()
  if (existing) {
    await ctx.db.patch(existing._id, fields)
    return { ...existing, ...fields }
  }
  const id = await ctx.db.insert('tags', {
    ...fields,
    counts: { companies: 0, tools: 0, workflows: 0 },
  })
  const inserted = await ctx.db.get(id)
  if (!inserted) {
    throw new Error(`tag ${key} vanished after insert`)
  }
  return inserted
}

/** Set an entity's taggings to exactly `tags`: upsert the wanted, delete the rest. */
async function setTaggings(
  ctx: MutationCtx,
  entity: Entity,
  tags: ReadonlyArray<Doc<'tags'>>,
  listed: boolean,
  publishedAt: number,
  counters: Counters
): Promise<void> {
  const wanted = new Set(tags.map((tag) => tag._id))
  const existing = await ctx.db
    .query('taggings')
    .withIndex('by_entity_tag', (q) => q.eq('entityId', entity.id))
    .take(64)
  for (const tagging of existing) {
    if (!wanted.has(tagging.tagId)) {
      await ctx.db.delete(tagging._id)
    }
  }
  const present = new Set(existing.map((tagging) => tagging.tagId))
  for (const tag of tags) {
    const base = {
      tagId: tag._id,
      namespace: tag.namespace,
      derived: tag.derived,
      listed,
      popularity: 0,
      publishedAt: listed ? publishedAt : 0,
    }
    if (present.has(tag._id)) {
      const row = existing.find((tagging) => tagging.tagId === tag._id)
      if (row) {
        await ctx.db.patch(row._id, base)
      }
    } else {
      switch (entity.type) {
        case 'company':
          await ctx.db.insert('taggings', {
            ...base,
            entityType: 'company',
            entityId: entity.id,
          })
          break
        case 'tool':
          await ctx.db.insert('taggings', {
            ...base,
            entityType: 'tool',
            entityId: entity.id,
          })
          break
        case 'workflow':
          await ctx.db.insert('taggings', {
            ...base,
            entityType: 'workflow',
            entityId: entity.id,
          })
          break
        default:
          break
      }
    }
    if (listed) {
      const count = counters.get(tag._id) ?? {
        companies: 0,
        tools: 0,
        workflows: 0,
      }
      if (entity.type === 'company') {
        count.companies += 1
      } else if (entity.type === 'tool') {
        count.tools += 1
      } else {
        count.workflows += 1
      }
      counters.set(tag._id, count)
    }
  }
}

async function upsertStats(
  ctx: MutationCtx,
  entity: Entity,
  now: number
): Promise<void> {
  const existing = await ctx.db
    .query('entityStats')
    .withIndex('by_entity', (q) => q.eq('entityId', entity.id))
    .unique()
  if (!existing) {
    await ctx.db.insert('entityStats', {
      entityType: entity.type,
      entityId: entity.id,
      views: 0,
      copies: 0,
      agentFetches: 0,
      saves: 0,
      forks: 0,
      teamsUsing: 0,
      reviewCount: 0,
      ratingSum: 0,
      updatedAt: now,
    })
  }
}

export const run = internalMutation({
  args: {},
  returns: v.object({
    tags: v.number(),
    companies: v.number(),
    tools: v.number(),
    workflows: v.number(),
    documents: v.object({
      rendered: v.number(),
      unchanged: v.number(),
      skipped: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const now = Date.now()
    const counters: Counters = new Map()
    const tagsByKey = new Map<string, Doc<'tags'>>()

    // 1. Tags: the managed list, then the derived namespaces.
    for (const seed of SEED_TAGS) {
      const tag = await upsertTag(ctx, seed, false)
      tagsByKey.set(tag.key, tag)
    }
    for (const seed of DERIVED_TAGS) {
      const tag = await upsertTag(ctx, seed, true)
      tagsByKey.set(tag.key, tag)
    }
    const tagOrThrow = (key: string): Doc<'tags'> => {
      const tag = tagsByKey.get(key)
      if (!tag) {
        throw new Error(`seed references unknown tag ${key}`)
      }
      return tag
    }

    // 2. Companies, with their handle and domain identifier.
    const companyIds = new Map<string, Id<'companies'>>()
    const companyNames = new Map<string, string>()
    for (const seed of SEED_COMPANIES) {
      const category = tagOrThrow(`category:${seed.category}`)
      const fields = {
        key: seed.key,
        name: seed.name,
        kind: 'vendor' as const,
        domain: seed.domain,
        tagline: seed.tagline,
        ...(seed.description ? { description: seed.description } : {}),
        logo: { url: `/logos/${seed.logo}`, fetchedAt: now },
        links: {
          website: seed.website,
          ...(seed.docs ? { docs: seed.docs } : {}),
          ...(seed.github ? { github: seed.github } : {}),
        },
        status: 'published' as const,
        provenance: { source: 'admin' as const },
        searchText: [
          seed.name,
          seed.tagline,
          category.label,
          ...category.synonyms,
        ].join(' '),
      }
      const existing = await ctx.db
        .query('companies')
        .withIndex('by_key', (q) => q.eq('key', seed.key))
        .unique()
      let id: Id<'companies'>
      if (existing) {
        await ctx.db.patch(existing._id, fields)
        id = existing._id
      } else {
        id = await ctx.db.insert('companies', { ...fields, publishedAt: now })
      }
      companyIds.set(seed.key, id)
      companyNames.set(seed.key, seed.name)

      const handle = await ctx.db
        .query('handles')
        .withIndex('by_handle', (q) => q.eq('handle', seed.key))
        .unique()
      if (!handle) {
        await ctx.db.insert('handles', {
          handle: seed.key,
          ownerType: 'company',
          ownerId: id,
        })
      }
      const identifier = `domain:${seed.domain}`
      const known = await ctx.db
        .query('identifiers')
        .withIndex('by_value', (q) => q.eq('value', identifier))
        .unique()
      if (!known) {
        await ctx.db.insert('identifiers', {
          value: identifier,
          entityType: 'company',
          entityId: id,
        })
      }
      await setTaggings(
        ctx,
        { type: 'company', id },
        [category],
        true,
        existing?.publishedAt ?? now,
        counters
      )
      await upsertStats(ctx, { type: 'company', id }, now)
    }

    // 3. Tools, with capability tags and the derived agent/has tags.
    const toolIds = new Map<string, Id<'tools'>>()
    const publishedTools = new Set<string>()
    for (const seed of SEED_TOOLS) {
      const companyId = companyIds.get(seed.companyKey)
      if (!companyId) {
        throw new Error(
          `tool ${seed.key} names unknown company ${seed.companyKey}`
        )
      }
      // A tool IS one capability now, so it is not TAGGED with one — the key's
      // own slug names it. The tag is still looked up, for its synonyms: a
      // person searching "enrichment" must still reach `clay/enrich-contacts`,
      // and the vocabulary is where that wording lives.
      const capability = tagOrThrow(
        `capability:${seed.key.split('/')[1] ?? ''}`
      )
      // Nobody has checked these facts: unverified, whatever the access says.
      const assessment = computeAgentLevel({
        access: seed.access,
        checkedAt: undefined,
        machineReadableDocs: undefined,
        now,
      })
      const isPublished = seed.access.length > 0
      const fields = {
        companyId,
        key: seed.key,
        name: seed.name,
        summary: seed.summary,
        ...(seed.description ? { description: seed.description } : {}),
        access: [...seed.access],
        agent: { ...assessment, computedAt: now },
        status: isPublished ? ('published' as const) : ('in_review' as const),
        provenance: { source: 'admin' as const },
        agentLevel: assessment.level,
        searchText: [
          seed.name,
          companyNames.get(seed.companyKey) ?? '',
          seed.summary,
          capability.label,
          ...capability.synonyms,
        ].join(' '),
      }
      const existing = await ctx.db
        .query('tools')
        .withIndex('by_key', (q) => q.eq('key', seed.key))
        .unique()
      let id: Id<'tools'>
      if (existing) {
        await ctx.db.patch(existing._id, {
          ...fields,
          publishedAt: isPublished ? (existing.publishedAt ?? now) : undefined,
        })
        id = existing._id
      } else {
        id = await ctx.db.insert('tools', {
          ...fields,
          ...(isPublished ? { publishedAt: now } : {}),
        })
      }
      toolIds.set(seed.key, id)
      if (isPublished) {
        publishedTools.add(seed.key)
      }
      const derived = [
        tagOrThrow(`agent:${assessment.level}`),
        ...[...new Set(seed.access.map((access) => access.type))].map((type) =>
          tagOrThrow(`has:${type}`)
        ),
      ]
      await setTaggings(
        ctx,
        { type: 'tool', id },
        derived,
        isPublished,
        existing?.publishedAt ?? now,
        counters
      )
      await upsertStats(ctx, { type: 'tool', id }, now)
    }

    // 4. Workflows: the workflow, its frozen version, the workflowTools projection.
    const workflowIds = new Map<string, Id<'workflows'>>()
    const total = SEED_WORKFLOWS.length
    for (const [index, seed] of SEED_WORKFLOWS.entries()) {
      const distinctTools = [...new Set(seed.steps.map((step) => step.toolKey))]
      for (const toolKey of distinctTools) {
        if (!publishedTools.has(toolKey)) {
          throw new Error(
            `workflow ${seed.key} uses unpublished tool ${toolKey}`
          )
        }
      }
      const tags = seed.tags.map(tagOrThrow)
      // Deterministic until the ranking job has real signals to count.
      const trendScore = 1000 - index * 10
      const topScore = (total - index) * 100
      const fields = {
        key: seed.key,
        title: seed.title,
        summary: seed.summary,
        visibility: 'public' as const,
        moderation: 'approved' as const,
        status: 'published' as const,
        provenance: { source: 'admin' as const },
        listed: true,
        toolCount: distinctTools.length,
        trendScore,
        topScore,
        searchText: [
          seed.title,
          seed.summary,
          ...distinctTools.map((key) => key.split('/')[1] ?? key),
          ...tags.flatMap((tag) => [tag.label, ...tag.synonyms]),
        ].join(' '),
      }
      const existing = await ctx.db
        .query('workflows')
        .withIndex('by_key', (q) => q.eq('key', seed.key))
        .unique()
      let id: Id<'workflows'>
      if (existing) {
        await ctx.db.patch(existing._id, fields)
        id = existing._id
      } else {
        id = await ctx.db.insert('workflows', { ...fields, publishedAt: now })
      }
      workflowIds.set(seed.key, id)

      const versionFields = {
        workflowId: id,
        version: 1,
        summary: seed.summary,
        inputs: seed.inputs.map((input) => ({ ...input })),
        steps: seed.steps.map((step) => {
          const toolId = toolIds.get(step.toolKey)
          if (!toolId) {
            throw new Error(
              `workflow ${seed.key} step names unknown tool ${step.toolKey}`
            )
          }
          return {
            key: step.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
            title: step.title,
            toolId,
            toolKey: step.toolKey,
            ...(step.via ? { via: step.via } : {}),
            instruction: step.instruction,
          }
        }),
        doneWhen: [...seed.doneWhen],
        ...(seed.notes ? { notes: seed.notes } : {}),
        scan: { status: 'clean' as const, reasons: [], scannedAt: now },
      }
      const existingVersion = await ctx.db
        .query('workflowVersions')
        .withIndex('by_workflow', (q) =>
          q.eq('workflowId', id).eq('version', 1)
        )
        .unique()
      let versionId: Id<'workflowVersions'>
      if (existingVersion) {
        await ctx.db.patch(existingVersion._id, versionFields)
        versionId = existingVersion._id
      } else {
        versionId = await ctx.db.insert('workflowVersions', versionFields)
      }
      await ctx.db.patch(id, { currentVersionId: versionId })

      // workflowTools is a PROJECTION of the current version: rebuild it.
      const links = await ctx.db
        .query('workflowTools')
        .withIndex('by_workflow', (q) => q.eq('workflowId', id))
        .take(32)
      for (const link of links) {
        await ctx.db.delete(link._id)
      }
      for (const toolKey of distinctTools) {
        const toolId = toolIds.get(toolKey)
        const tool = toolId ? await ctx.db.get(toolId) : null
        if (tool) {
          await ctx.db.insert('workflowTools', {
            workflowId: id,
            toolId: tool._id,
            companyId: tool.companyId,
            listed: true,
            trendScore,
          })
        }
      }
      await setTaggings(
        ctx,
        { type: 'workflow', id },
        tags,
        true,
        existing?.publishedAt ?? now,
        counters
      )
      await upsertStats(ctx, { type: 'workflow', id }, now)
    }

    // 5. Tag counts are a projection of the taggings written above.
    for (const tag of tagsByKey.values()) {
      const counts = counters.get(tag._id) ?? {
        companies: 0,
        tools: 0,
        workflows: 0,
      }
      await ctx.db.patch(tag._id, { counts })
    }

    // 6. Files, through the one render path.
    const documents = { rendered: 0, unchanged: 0, skipped: 0 }
    const targets: Array<Entity> = [
      ...[...companyIds.values()].map((id) => ({
        type: 'company' as const,
        id,
      })),
      ...[...toolIds.values()].map((id) => ({ type: 'tool' as const, id })),
      ...[...workflowIds.values()].map((id) => ({
        type: 'workflow' as const,
        id,
      })),
    ]
    for (const target of targets) {
      documents[await renderAndStoreDocument(ctx, target, now)] += 1
    }

    return {
      tags: tagsByKey.size,
      companies: companyIds.size,
      tools: toolIds.size,
      workflows: workflowIds.size,
      documents,
    }
  },
})

const RESET_TABLES = [
  'documents',
  'entityStats',
  'taggings',
  'workflowTools',
  'workflowVersions',
  'workflows',
  'tools',
  'identifiers',
  'handles',
  'companies',
  'tags',
  'keyAliases',
] as const

/**
 * Delete the seeded catalog, a bounded number of rows per call. Returns how
 * many rows are still left; call again until it is zero. Never touches
 * `users`, `teams` or anything an auth provider owns.
 */
export const reset = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number(), remaining: v.number() }),
  handler: async (ctx) => {
    const budget = 1500
    let deleted = 0
    let remaining = 0
    for (const table of RESET_TABLES) {
      const rows = await ctx.db.query(table).take(budget - deleted + 1)
      const toDelete = rows.slice(0, Math.max(0, budget - deleted))
      for (const row of toDelete) {
        await ctx.db.delete(row._id)
      }
      deleted += toDelete.length
      remaining += rows.length - toDelete.length
    }
    return { deleted, remaining }
  },
})
