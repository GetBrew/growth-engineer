import { isValidKeyPart, isValidOwnedKey } from '@/lib/catalog/keys'
import {
  type AccessFrontmatter,
  type ToolFrontmatter,
  toolSchema,
} from '@/lib/schemas/content'
import type { Access, Company, Tag, Tool, Workflow } from '@/lib/types/catalog'
import {
  dateToMs,
  distinctToolKeys,
  searchTextOf,
  slugify,
  toolTags,
  workflowTags,
} from './derive'
import type { ProblemList } from './errors'
import { parseFile } from './parse-file'
import { type ParsedWorkflow, parseWorkflowFile } from './parse-workflow'
import type { ContentFile } from './read-tree'

/**
 * Tools and workflows: the two entities with references to resolve. A tool
 * composes its ways in from the company's access options plus its own
 * operation; a workflow's steps must name published tools. Every miss is a
 * problem with a file path, never a crash.
 */

/** company handle → access id → the option as written. */
export type AccessOptions = Map<string, Map<string, AccessFrontmatter>>

type ToolFile = ContentFile & { kind: 'tool' }
type WorkflowFile = ContentFile & { kind: 'workflow' }

/** One option plus the tool's operation = one way in. */
function toAccess(option: AccessFrontmatter, operation: string): Access {
  const common = {
    official: option.official,
    operation,
    auth: option.auth,
    ...(option.maintainer ? { maintainer: option.maintainer } : {}),
    ...(option.docsUrl ? { docsUrl: option.docsUrl } : {}),
  }
  switch (option.type) {
    case 'mcp':
      return {
        type: 'mcp',
        ...common,
        transport: option.transport,
        ...(option.url ? { url: option.url } : {}),
        ...(option.command ? { command: option.command } : {}),
      }
    case 'cli':
      return {
        type: 'cli',
        ...common,
        installCommand: option.installCommand,
        binary: option.binary,
      }
    default:
      return {
        type: 'api',
        ...common,
        baseUrl: option.baseUrl,
      }
  }
}

/* ─────────────────────────────────── tools ──────────────────────────────── */

type ToolContext = {
  companies: ReadonlyMap<string, Company>
  companyFolders: ReadonlySet<string>
  accessOptions: AccessOptions
  tags: ReadonlyMap<string, Tag>
}

/** The tool's ways in: each listed id resolved against the company's options. */
function resolveAccess(
  file: ToolFile,
  data: ToolFrontmatter,
  options: ReadonlyMap<string, AccessFrontmatter>,
  problems: ProblemList
): Array<Access> {
  const access: Array<Access> = []
  for (const [id, operation] of Object.entries(data.access)) {
    const option = options.get(id)
    if (option) {
      access.push(toAccess(option, operation))
    } else {
      problems.add(
        file.path,
        `access "${id}" is not a file under companies/${file.handle}/access/`
      )
    }
  }
  if (data.status === 'published' && access.length === 0) {
    problems.add(
      file.path,
      'a published tool needs at least one way in under `access:` — or `status: draft` until it has one'
    )
  }
  return access
}

function toTool(
  file: ToolFile,
  parsed: { data: ToolFrontmatter; body: string },
  company: Company,
  tagMap: ReadonlyMap<string, Tag>,
  access: ReadonlyArray<Access>
): Tool {
  const { data, body } = parsed
  const capability = file.slug
  const tags = toolTags({ capability, access }, company.category)
  return {
    key: `${file.handle}/${file.slug}`,
    companyKey: file.handle,
    name: data.name,
    summary: data.summary,
    ...(body ? { description: body } : {}),
    capability,
    access,
    tags,
    status: data.status === 'deprecated' ? 'deprecated' : 'published',
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    searchText: searchTextOf(
      [data.name, company.name, data.summary],
      tags,
      tagMap
    ),
  }
}

/** Why a tool file cannot be placed, or null when its path is fine. */
function toolPathProblem(
  file: ToolFile,
  companyFolders: ReadonlySet<string>
): string | null {
  if (!companyFolders.has(file.handle)) {
    return `companies/${file.handle}/ has no company.md`
  }
  if (
    !(
      isValidKeyPart(file.slug) &&
      isValidOwnedKey(`${file.handle}/${file.slug}`)
    )
  ) {
    return `"${file.slug}" is not a valid tool slug`
  }
  return null
}

export function buildTools(
  files: ReadonlyArray<ContentFile>,
  context: ToolContext,
  problems: ProblemList
): Map<string, Tool> {
  const tools = new Map<string, Tool>()
  for (const file of files) {
    if (file.kind !== 'tool') {
      continue
    }
    const pathProblem = toolPathProblem(file, context.companyFolders)
    if (pathProblem) {
      problems.add(file.path, pathProblem)
      continue
    }
    const parsed = parseFile(file, toolSchema, problems)
    const company = context.companies.get(file.handle)
    if (!(parsed && company)) {
      continue
    }
    if (!context.tags.has(`capability:${file.slug}`)) {
      problems.add(
        file.path,
        `"${file.slug}" is not a capability: a tool is ONE function, named after a capability in tags.yml — add the capability in the same pull request if none fits`
      )
    }
    const access = resolveAccess(
      file,
      parsed.data,
      context.accessOptions.get(file.handle) ?? new Map(),
      problems
    )
    if (parsed.data.status !== 'draft') {
      const tool = toTool(file, parsed, company, context.tags, access)
      tools.set(tool.key, tool)
    }
  }
  return tools
}

/* ────────────────────────────────── workflows ───────────────────────────── */

type WorkflowContext = {
  tools: ReadonlyMap<string, Tool>
  tags: ReadonlyMap<string, Tag>
}

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

/** Every step names a published tool. */
function checkSteps(
  file: WorkflowFile,
  parsed: ParsedWorkflow,
  tools: ReadonlyMap<string, Tool>,
  problems: ProblemList
): void {
  for (const [index, step] of parsed.data.steps.entries()) {
    const line = parsed.stepLines[index]
    if (!tools.has(step.tool)) {
      problems.add(
        file.path,
        `step ${index + 1}: "${step.tool}" is not a published tool (companies/<handle>/tools/<slug>.md)`,
        line
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
    status: data.status,
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
): Map<string, Workflow> {
  const workflows = new Map<string, Workflow>()
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
    checkSteps(file, parsed, context.tools, problems)
    const workflow = toWorkflow(file, parsed, context)
    if (workflow.featured !== undefined) {
      const holder = featuredRanks.get(workflow.featured)
      if (holder) {
        problems.add(
          file.path,
          `featured: rank ${workflow.featured} is already taken by ${holder}`
        )
      }
      featuredRanks.set(workflow.featured, workflow.key)
    }
    workflows.set(workflow.key, workflow)
  }
  return workflows
}
