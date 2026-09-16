import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'
import {
  DERIVED_TAG_NAMESPACES,
  type EntityType,
  formatRef,
} from './model/keys'
import {
  type RenderedDocument,
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from './model/render_markdown'

/**
 * The ONE render path: structured fields → `documents` row.
 *
 * Nothing else writes `documents.markdown`. The seed, the render mutations and
 * (later) the admin edit flow all call `renderAndStoreDocument`. A file whose
 * hash did not change is not rewritten — a write re-runs every live query
 * that read the row, so an unchanged file must stay untouched.
 */

export type RenderTarget =
  | { type: 'company'; id: Id<'companies'> }
  | { type: 'tool'; id: Id<'tools'> }
  | { type: 'workflow'; id: Id<'workflows'> }

export type RenderOutcome = 'rendered' | 'unchanged' | 'skipped'

/** Active tags on an entity, curated namespaces only unless asked otherwise. */
async function activeTagsOf(
  ctx: MutationCtx,
  entityId: Id<'companies'> | Id<'tools'> | Id<'workflows'>,
  options: { includeDerived: boolean }
): Promise<Array<Doc<'tags'>>> {
  const taggings = await ctx.db
    .query('taggings')
    .withIndex('by_entity_tag', (q) => q.eq('entityId', entityId))
    .take(64)
  const wanted = taggings.filter(
    (tagging) =>
      options.includeDerived || !DERIVED_TAG_NAMESPACES.has(tagging.namespace)
  )
  const tags = await Promise.all(
    wanted.map((tagging) => ctx.db.get(tagging.tagId))
  )
  return tags.filter(
    (tag): tag is Doc<'tags'> => tag !== null && tag.status === 'active'
  )
}

async function renderTool(
  ctx: MutationCtx,
  tool: Doc<'tools'>,
  now: number
): Promise<RenderedDocument | null> {
  const company = await ctx.db.get(tool.companyId)
  if (!company) {
    return null
  }
  const capabilities = (
    await activeTagsOf(ctx, tool._id, { includeDerived: false })
  )
    .filter((tag) => tag.namespace === 'capability')
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((tag) => ({ slug: tag.slug, label: tag.label }))
  return renderToolDocument({
    key: tool.key,
    name: tool.name,
    companyKey: company.key,
    summary: tool.summary,
    description: tool.description,
    access: tool.access,
    agent: { level: tool.agent.level, reason: tool.agent.reason },
    capabilities,
    updatedAt: now,
  })
}

async function renderWorkflow(
  ctx: MutationCtx,
  workflow: Doc<'workflows'>,
  now: number
): Promise<RenderedDocument | null> {
  if (!workflow.currentVersionId) {
    return null
  }
  const version = await ctx.db.get(workflow.currentVersionId)
  if (!version) {
    return null
  }
  const toolIds = [...new Set(version.steps.map((step) => step.toolId))]
  const loaded = await Promise.all(toolIds.map((toolId) => ctx.db.get(toolId)))
  const tools = loaded
    .filter((tool): tool is Doc<'tools'> => tool !== null)
    .map((tool) => ({ key: tool.key, name: tool.name, access: tool.access }))
  const tags = (
    await activeTagsOf(ctx, workflow._id, { includeDerived: false })
  )
    .map((tag) => tag.key)
    .sort()
  return renderWorkflowDocument({
    key: workflow.key,
    version: version.version,
    title: workflow.title,
    format: workflow.format,
    tools,
    tags,
    inputs: version.inputs,
    steps: version.steps.map((step) => ({
      title: step.title,
      toolKey: step.toolKey,
      via: step.via,
      instruction: step.instruction,
    })),
    doneWhen: version.doneWhen,
    notes: version.notes,
    updatedAt: now,
  })
}

async function renderCompany(
  ctx: MutationCtx,
  company: Doc<'companies'>,
  now: number
): Promise<RenderedDocument> {
  const tools = await ctx.db
    .query('tools')
    .withIndex('by_company', (q) =>
      q.eq('companyId', company._id).eq('status', 'published')
    )
    .take(100)
  return renderCompanyDocument({
    key: company.key,
    name: company.name,
    tagline: company.tagline,
    description: company.description,
    links: { website: company.links.website, docs: company.links.docs },
    tools: tools.map((tool) => ({
      key: tool.key,
      name: tool.name,
      summary: tool.summary,
      agentLevel: tool.agent.level,
    })),
    updatedAt: now,
  })
}

/** Render one entity's file and store it, skipping the write when unchanged. */
export async function renderAndStoreDocument(
  ctx: MutationCtx,
  target: RenderTarget,
  now: number
): Promise<RenderOutcome> {
  let rendered: RenderedDocument | null
  let key: string
  switch (target.type) {
    case 'tool': {
      const tool = await ctx.db.get(target.id)
      if (!tool) {
        return 'skipped'
      }
      key = tool.key
      rendered = await renderTool(ctx, tool, now)
      break
    }
    case 'workflow': {
      const workflow = await ctx.db.get(target.id)
      if (!workflow) {
        return 'skipped'
      }
      key = workflow.key
      rendered = await renderWorkflow(ctx, workflow, now)
      break
    }
    case 'company': {
      const company = await ctx.db.get(target.id)
      if (!company) {
        return 'skipped'
      }
      key = company.key
      rendered = await renderCompany(ctx, company, now)
      break
    }
    default:
      return 'skipped'
  }
  if (!rendered) {
    return 'skipped'
  }

  const ref = formatRef(target.type, key)
  const existing = await ctx.db
    .query('documents')
    .withIndex('by_ref', (q) => q.eq('ref', ref))
    .unique()

  if (existing && existing.hash === rendered.hash) {
    if (existing.stale) {
      await ctx.db.patch(existing._id, { stale: false, renderedAt: now })
    }
    return 'unchanged'
  }

  const row = {
    ref,
    entityType: target.type as EntityType,
    entityId: target.id,
    markdown: rendered.markdown,
    hash: rendered.hash,
    lineCount: rendered.lineCount,
    stale: false,
    renderedAt: now,
  }
  if (existing) {
    await ctx.db.patch(existing._id, row)
  } else {
    await ctx.db.insert('documents', row)
  }
  return 'rendered'
}

/**
 * A tool changed: its own file, its company's index, and every workflow file
 * that uses it are stale until the scheduled batch re-renders them.
 */
export async function markStaleForTool(
  ctx: MutationCtx,
  toolId: Id<'tools'>,
  now: number
): Promise<number> {
  const tool = await ctx.db.get(toolId)
  if (!tool) {
    return 0
  }
  const entityIds: Array<Id<'tools'> | Id<'companies'> | Id<'workflows'>> = [
    toolId,
    tool.companyId,
  ]
  const links = await ctx.db
    .query('workflowTools')
    .withIndex('by_tool', (q) => q.eq('toolId', toolId))
    .take(500)
  for (const link of links) {
    entityIds.push(link.workflowId)
  }
  const documents = await Promise.all(
    entityIds.map((entityId) =>
      ctx.db
        .query('documents')
        .withIndex('by_entity', (q) => q.eq('entityId', entityId))
        .unique()
    )
  )
  let marked = 0
  for (const document of documents) {
    if (document && !document.stale) {
      // biome-ignore lint/performance/noAwaitInLoops: sequential writes inside one mutation, by design
      await ctx.db.patch(document._id, { stale: true, renderedAt: now })
      marked += 1
    }
  }
  return marked
}
