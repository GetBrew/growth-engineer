import { derivedTagKeys } from '@/lib/catalog/derived-tags'
import {
  DERIVED_TAG_NAMESPACES,
  isValidKeyPart,
  isValidOwnedKey,
} from '@/lib/catalog/keys'
import {
  type AccessFrontmatter,
  type ToolFrontmatter,
  toolSchema,
  type WorkflowFrontmatter,
  workflowSchema,
} from '@/lib/schemas/content'
import type { Access, Company, Tag, Tool, Workflow } from '@/lib/types/catalog'
import {
  dateToMs,
  distinctToolKeys,
  slugify,
  toolSearchText,
  workflowSearchText,
} from './derive'
import type { ProblemList } from './errors'
import { parseFile } from './parse-file'
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
        ...(option.repoUrl ? { repoUrl: option.repoUrl } : {}),
      }
    case 'cli':
      return {
        type: 'cli',
        ...common,
        installCommand: option.installCommand,
        binary: option.binary,
        ...(option.repoUrl ? { repoUrl: option.repoUrl } : {}),
      }
    default:
      return {
        type: 'api',
        ...common,
        baseUrl: option.baseUrl,
        ...(option.openApiUrl ? { openApiUrl: option.openApiUrl } : {}),
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
  capability: Tag | undefined,
  access: ReadonlyArray<Access>
): Tool {
  const { data, body } = parsed
  const updatedAt = dateToMs(data.updated)
  const tool: Tool = {
    key: `${file.handle}/${file.slug}`,
    companyKey: file.handle,
    name: data.name,
    summary: data.summary,
    ...(body ? { description: body } : {}),
    capability: file.slug,
    access,
    tags: [],
    status: data.status === 'deprecated' ? 'deprecated' : 'published',
    updatedAt,
    aliases: data.aliases,
    searchText: toolSearchText(
      data,
      company.name,
      capability,
      access.map((entry) => entry.type)
    ),
  }
  tool.tags = derivedTagKeys(tool)
  return tool
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
    const capability = context.tags.get(`capability:${file.slug}`)
    if (!capability) {
      problems.add(
        file.path,
        `"${file.slug}" is not a capability: a tool is ONE function, named after a slug in tags/capability/ — add the capability in the same pull request if none fits`
      )
    }
    const access = resolveAccess(
      file,
      parsed.data,
      context.accessOptions.get(file.handle) ?? new Map(),
      problems
    )
    if (parsed.data.status !== 'draft') {
      const tool = toTool(file, parsed, company, capability, access)
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

/** The curated tags a workflow names; the derived ones are refused. */
function resolveTags(
  file: WorkflowFile,
  keys: ReadonlyArray<string>,
  tags: ReadonlyMap<string, Tag>,
  problems: ProblemList
): Array<Tag> {
  const resolved: Array<Tag> = []
  for (const tagKey of keys) {
    const namespace = tagKey.split(':')[0] ?? ''
    const tag = tags.get(tagKey)
    if (DERIVED_TAG_NAMESPACES.has(namespace as never)) {
      problems.add(
        file.path,
        `tags: "${tagKey}" is computed from tools, not a tag a workflow carries`
      )
    } else if (tag) {
      resolved.push(tag)
    } else {
      problems.add(file.path, `tags: "${tagKey}" is not a file under tags/`)
    }
  }
  return resolved
}

/** Every step names a published tool, and a `via` the tool actually offers. */
function checkSteps(
  file: WorkflowFile,
  steps: WorkflowFrontmatter['steps'],
  tools: ReadonlyMap<string, Tool>,
  problems: ProblemList
): void {
  for (const [index, step] of steps.entries()) {
    const tool = tools.get(step.tool)
    if (!tool) {
      problems.add(
        file.path,
        `steps.${index}.tool: "${step.tool}" is not a published tool (companies/<handle>/tools/<slug>.md)`
      )
    } else if (
      step.via &&
      !tool.access.some((entry) => entry.type === step.via)
    ) {
      problems.add(
        file.path,
        `steps.${index}.via: ${step.tool} has no ${step.via} way in`
      )
    }
  }
}

function toWorkflow(
  file: WorkflowFile,
  parsed: { data: WorkflowFrontmatter; body: string },
  tags: ReadonlyArray<Tag>
): Workflow {
  const { data, body } = parsed
  const steps = data.steps.map((step) => ({
    key: slugify(step.title),
    title: step.title,
    toolKey: step.tool,
    ...(step.via ? { via: step.via } : {}),
    instruction: step.instruction,
  }))
  const toolKeys = distinctToolKeys(steps)
  return {
    key: file.name,
    author: data.author,
    title: data.title,
    summary: data.summary,
    version: data.version,
    tags: data.tags,
    inputs: data.inputs,
    steps,
    doneWhen: data.doneWhen,
    ...(body ? { notes: body } : {}),
    ...(data.featured === undefined ? {} : { featured: data.featured }),
    toolKeys,
    toolCount: toolKeys.length,
    status: data.status,
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    searchText: workflowSearchText({ ...data, toolKeys }, tags),
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
    const parsed = parseFile(file, workflowSchema, problems)
    if (!parsed) {
      continue
    }
    const tags = resolveTags(file, parsed.data.tags, context.tags, problems)
    checkSteps(file, parsed.data.steps, context.tools, problems)
    const workflow = toWorkflow(file, parsed, tags)
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
