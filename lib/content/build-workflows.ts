import { isValidKeyPart } from '@/lib/catalog/keys'
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
 * (below), and the workflow tags itself with motion and channel only; its
 * capabilities come from its tools. A draft is checked and left out: no
 * page, no file. Every miss is a problem with a file path, never a crash.
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

/** The namespaces a workflow tags itself with; the rest are computed. */
const WORKFLOW_TAG_NAMESPACES: ReadonlyArray<string> = ['motion', 'channel']

/** A workflow names only motion and channel tags, each one in tags.yml. */
function checkTags(
  file: WorkflowFile,
  keys: ReadonlyArray<string>,
  tags: ReadonlyMap<string, Tag>,
  problems: ProblemList
): void {
  for (const tagKey of keys) {
    const namespace = tagKey.split(':')[0] ?? ''
    if (!WORKFLOW_TAG_NAMESPACES.includes(namespace)) {
      problems.add(
        file.path,
        `tags: "${tagKey}" is computed from the workflow's tools; tag a workflow with motion: and channel: only`
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
    toolKey: step.tool,
    instruction: step.instruction,
  }))
  const toolKeys = distinctToolKeys(steps)
  const tags = workflowTags(
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
    tags,
    inputs: data.inputs,
    steps,
    doneWhen: data.doneWhen,
    ...(notes ? { notes } : {}),
    ...(data.featured === undefined ? {} : { featured: data.featured }),
    toolKeys,
    toolCount: toolKeys.length,
    status: data.status === 'deprecated' ? 'deprecated' : 'published',
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    // Both halves of each tool key: `clay/enrich-contacts` finds the workflow
    // by "clay" as well as by "enrich" — its rows show the vendor's logo.
    searchText: searchTextOf(
      [
        data.title,
        data.summary,
        data.author,
        ...toolKeys.flatMap((key) => key.split('/')),
      ],
      tags,
      context.tags
    ),
  }
}

/** Why a workflow file cannot be placed, or null when its path is fine. */
function workflowPathProblem(file: WorkflowFile): string | null {
  return isValidKeyPart(file.name)
    ? null
    : `"${file.name}" is not a valid workflow name: lowercase letters, digits and hyphens`
}

export function buildWorkflows(
  files: ReadonlyArray<ContentFile>,
  context: WorkflowContext,
  problems: ProblemList
): { workflows: Map<string, Workflow>; drafts: Set<string> } {
  const workflows = new Map<string, Workflow>()
  const drafts = new Set<string>()
  const featuredRanks = new Map<number, string>()
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
    checkTags(file, parsed.data.tags, context.tags, problems)
    checkSteps(file, parsed, context, problems)
    // A rank is unique across every file, drafts included: publishing one
    // must not collide with a rank already taken.
    const { featured } = parsed.data
    if (featured !== undefined) {
      const holder = featuredRanks.get(featured)
      if (holder) {
        problems.add(
          file.path,
          `featured: rank ${featured} is already taken by ${holder}`
        )
      }
      featuredRanks.set(featured, file.name)
    }
    if (parsed.data.status === 'draft') {
      drafts.add(file.name)
    } else {
      workflows.set(file.name, toWorkflow(file, parsed, context))
    }
  }
  return { workflows, drafts }
}
