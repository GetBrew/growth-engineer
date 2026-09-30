import { isValidKeyPart, RESERVED_WORKFLOW_KEYS } from '@/lib/catalog/keys'
import type { Tag, Tool, Workflow } from '@/lib/types/catalog'
import {
  dateToMs,
  distinctToolKeys,
  searchTextOf,
  slugify,
  workflowTags,
} from './derive'
import type { ProblemList } from './errors'
import { type ParsedWorkflow, parseWorkflowFile } from './parse-workflow'
import type { ContentFile } from './read-tree'

/**
 * Workflows: a header of facts and a body of steps (./parse-workflow.ts),
 * then the cross-file checks — every step's tool fits the workflow's status
 * (below), the workflow names one motion from tags.yml and tags itself with
 * channels only; its capabilities come from its tools. A draft is checked and
 * left out: no page, no file. Every miss is a problem with a file path, never
 * a crash.
 *
 *   workflow status   may use tools that are
 *   published         published
 *   deprecated        published or deprecated
 *   draft             any tool file, drafts included
 */

type WorkflowFile = ContentFile & { kind: 'workflow' }

type WorkflowContext = {
  /** Published and deprecated tools. */
  tools: ReadonlyMap<string, Tool>
  /** Draft tool keys: real files, not published. */
  drafts: ReadonlySet<string>
  tags: ReadonlyMap<string, Tag>
}

type Status = 'published' | 'deprecated' | 'draft'

/** The one motion a workflow serves is in tags.yml, like a company's category. */
function checkMotion(
  file: WorkflowFile,
  motion: string,
  tags: ReadonlyMap<string, Tag>,
  problems: ProblemList
): void {
  if (!tags.has(`motion:${motion}`)) {
    const motions = [...tags.values()]
      .filter((tag) => tag.namespace === 'motion')
      .map((tag) => tag.slug)
    problems.add(
      file.path,
      `motion "${motion}" is not in tags.yml: use one of ${motions.join(', ')}`
    )
  }
}

/** A workflow tags itself with channels only, each one in tags.yml. */
function checkTags(
  file: WorkflowFile,
  keys: ReadonlyArray<string>,
  tags: ReadonlyMap<string, Tag>,
  problems: ProblemList
): void {
  for (const tagKey of keys) {
    const [namespace = '', slug = ''] = tagKey.split(':')
    if (namespace === 'motion') {
      problems.add(
        file.path,
        `tags: "${tagKey}" goes in its own field, \`motion: ${slug}\`: a workflow names one motion`
      )
    } else if (namespace !== 'channel') {
      problems.add(
        file.path,
        `tags: "${tagKey}" is computed from the workflow's tools; tag a workflow with channel: only`
      )
    } else if (!tags.has(tagKey)) {
      problems.add(file.path, `tags: "${tagKey}" is not in tags.yml`)
    }
  }
}

/** Why a step's tool does not fit a workflow of this status, or null. */
function stepProblem(
  toolKey: string,
  status: Status,
  context: WorkflowContext
): string | null {
  const tool = context.tools.get(toolKey)
  if (!(tool || context.drafts.has(toolKey))) {
    return `"${toolKey}" is not a tool (companies/<handle>/tools/<name>.md)`
  }
  if (status === 'draft') {
    return null
  }
  if (!tool) {
    return `"${toolKey}" is a draft: publish it, or set this workflow to \`status: draft\``
  }
  if (status === 'published' && tool.status === 'deprecated') {
    return `"${toolKey}" is deprecated: a published workflow uses published tools only`
  }
  return null
}

function checkSteps(
  file: WorkflowFile,
  parsed: ParsedWorkflow,
  context: WorkflowContext,
  problems: ProblemList
): void {
  for (const [index, step] of parsed.data.steps.entries()) {
    if (step.tool === undefined) {
      continue
    }
    const problem = stepProblem(step.tool, parsed.data.status, context)
    if (problem) {
      problems.add(
        file.path,
        `step ${index + 1}: ${problem}`,
        parsed.stepLines[index]
      )
    }
  }
}

function toWorkflow(
  file: WorkflowFile,
  parsed: ParsedWorkflow,
  context: WorkflowContext
): Workflow {
  const { data, notes } = parsed
  // A step's key is its title as a slug, made unique within the workflow: two
  // steps may share a title ("Send"), never a key.
  const seen = new Map<string, number>()
  const stepKey = (title: string) => {
    const slug = slugify(title) || 'step'
    const count = (seen.get(slug) ?? 0) + 1
    seen.set(slug, count)
    return count === 1 ? slug : `${slug}-${count}`
  }
  const steps = data.steps.map((step) => ({
    key: stepKey(step.title),
    title: step.title,
    ...(step.tool === undefined ? {} : { toolKey: step.tool }),
    instruction: step.instruction,
  }))
  const toolKeys = distinctToolKeys(steps)
  const tags = workflowTags(
    data.motion,
    data.tags,
    toolKeys.flatMap((key) => {
      const tool = context.tools.get(key)
      return tool ? [tool] : []
    })
  )
  return {
    key: file.name,
    author: data.author,
    title: data.title,
    summary: data.summary,
    motion: data.motion,
    tags,
    outcome: data.outcome,
    inputs: data.inputs,
    steps,
    ...(notes ? { notes } : {}),
    isFeatured: data.featured,
    toolKeys,
    toolCount: toolKeys.length,
    status: data.status === 'deprecated' ? 'deprecated' : 'published',
    addedAt: dateToMs(data.added),
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    // Both halves of each tool key: `apollo/enrich-person` finds the workflow
    // by "apollo" as well as by "enrich" — its rows show the vendor's logo.
    // Its step titles and input names too: "trial" finds a `trial_plan`.
    searchText: searchTextOf(
      [
        data.title,
        data.summary,
        data.author,
        ...toolKeys.flatMap((key) => key.split('/')),
        ...steps.map((step) => step.title),
        ...data.inputs.map((input) => input.name.replaceAll('_', ' ')),
      ],
      tags,
      context.tags
    ),
  }
}

/** Why a workflow file cannot be placed, or null when its path is fine. */
function workflowPathProblem(file: WorkflowFile): string | null {
  if (!isValidKeyPart(file.name)) {
    return `"${file.name}" is not a valid workflow name: lowercase letters, digits and hyphens`
  }
  return RESERVED_WORKFLOW_KEYS.has(file.name)
    ? `"${file.name}" is reserved: it names an MCP contribute prompt`
    : null
}

export function buildWorkflows(
  files: ReadonlyArray<ContentFile>,
  context: WorkflowContext,
  problems: ProblemList
): { workflows: Map<string, Workflow>; drafts: Set<string> } {
  const workflows = new Map<string, Workflow>()
  const drafts = new Set<string>()
  for (const file of files) {
    if (file.kind !== 'workflow') {
      continue
    }
    const pathProblem = workflowPathProblem(file)
    if (pathProblem) {
      problems.add(file.path, pathProblem)
      continue
    }
    const parsed = parseWorkflowFile(file.path, file.source, problems)
    if (!parsed) {
      continue
    }
    checkMotion(file, parsed.data.motion, context.tags, problems)
    checkTags(file, parsed.data.tags, context.tags, problems)
    checkSteps(file, parsed, context, problems)
    if (parsed.data.status === 'draft') {
      drafts.add(file.name)
    } else {
      workflows.set(file.name, toWorkflow(file, parsed, context))
    }
  }
  return { workflows, drafts }
}
