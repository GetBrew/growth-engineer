import { isValidKeyPart, isValidOwnedKey } from '@/lib/catalog/keys'
import {
  type CompanyWays,
  type ToolFrontmatter,
  toolSchema,
} from '@/lib/schemas/content'
import type {
  Access,
  AccessType,
  Auth,
  Company,
  Tag,
  Tool,
} from '@/lib/types/catalog'
import { dateToMs, searchTextOf, toolTags } from './derive'
import type { ProblemList } from './errors'
import { parseFile } from './parse-file'
import type { ContentFile } from './read-tree'

/**
 * Tools: one function each, `companies/<handle>/tools/<name>.md`. The file
 * names the call on each of its company's ways in (`mcp:`, `cli:`, `api:`);
 * a way plus a call is one `Access`. It is a header and nothing else: the
 * `summary` says what the call does, `notes` what to know before calling.
 * Every miss is a problem with a file path, never a crash.
 */

type ToolFile = ContentFile & { kind: 'tool' }

const WAYS: ReadonlyArray<AccessType> = ['mcp', 'cli', 'api']

/**
 * Fields a rendered tool file has that a source file never writes — copying
 * one's shape is an easy mistake — and what to write instead.
 */
const RENDERED_ONLY = {
  access:
    'is computed: write each call at the top level, `mcp: <tool name>`, `cli: <command>`, `api: METHOD /path`',
}

type Way = NonNullable<CompanyWays[AccessType]>

function authOf(way: Way): Auth {
  if (way.auth === 'api_key') {
    return {
      method: 'api_key',
      envVar: way.env ?? '',
      ...('header' in way && way.header ? { header: way.header } : {}),
      ...('scheme' in way && way.scheme ? { scheme: way.scheme } : {}),
      ...(way.keyUrl ? { keyUrl: way.keyUrl } : {}),
    }
  }
  return { method: way.auth }
}

/** What every way in carries, whatever its type. */
function common(way: Way, operation: string) {
  return {
    official: way.maintainer === undefined,
    operation,
    auth: authOf(way),
    ...(way.maintainer ? { maintainer: way.maintainer } : {}),
    ...(way.docs ? { docsUrl: way.docs } : {}),
    ...(way.notes ? { notes: way.notes } : {}),
  }
}

/** One of the company's ways plus the tool's call on it = one way in. */
function toAccess(
  ways: CompanyWays,
  type: AccessType,
  operation: string
): Access | null {
  switch (type) {
    case 'mcp': {
      const way = ways.mcp
      if (!way) {
        return null
      }
      return {
        type,
        ...common(way, operation),
        transport: way.url ? 'remote' : 'local',
        ...(way.url ? { url: way.url } : {}),
        ...(way.command ? { command: way.command } : {}),
      }
    }
    case 'cli': {
      const way = ways.cli
      if (!way) {
        return null
      }
      return {
        type,
        ...common(way, operation),
        installCommand: way.install,
        binary: way.binary,
      }
    }
    default: {
      const way = ways.api
      if (!way) {
        return null
      }
      return { type: 'api', ...common(way, operation), baseUrl: way.url }
    }
  }
}

/** The tool's ways in: each call it names, on the way its company declares. */
function resolveAccess(
  file: ToolFile,
  data: ToolFrontmatter,
  ways: CompanyWays,
  problems: ProblemList
): Array<Access> {
  const access: Array<Access> = []
  for (const type of WAYS) {
    const operation = data[type]
    if (operation === undefined) {
      continue
    }
    const resolved = toAccess(ways, type, operation)
    if (!resolved) {
      problems.add(
        file.path,
        `${type}: companies/${file.handle}/company.md declares no ${type} way in`
      )
      continue
    }
    if (
      resolved.type === 'cli' &&
      !operation.startsWith(`${resolved.binary} `)
    ) {
      problems.add(
        file.path,
        `cli: "${operation}" must start with the company's binary, \`${resolved.binary} \``
      )
    }
    access.push(resolved)
  }
  if (data.status === 'published' && access.length === 0) {
    problems.add(
      file.path,
      'a published tool needs at least one call — `mcp:`, `cli:` or `api:` — or `status: draft` until it has one'
    )
  }
  if (data.status === 'published' && !data.docs) {
    problems.add(
      file.path,
      'a published tool cites the page that documents its call: add `docs:` — or `status: draft` until one does'
    )
  }
  return access
}

function toTool(
  file: ToolFile,
  data: ToolFrontmatter,
  company: Company,
  tagMap: ReadonlyMap<string, Tag>,
  access: ReadonlyArray<Access>
): Tool {
  const tags = toolTags(
    { capability: data.capability, access },
    company.category
  )
  return {
    key: `${file.handle}/${file.slug}`,
    companyKey: file.handle,
    name: data.name,
    summary: data.summary,
    capability: data.capability,
    ...(data.notes ? { notes: data.notes } : {}),
    ...(data.docs ? { docs: data.docs } : {}),
    access,
    tags,
    status: data.status === 'deprecated' ? 'deprecated' : 'published',
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    // A tag's synonyms describe what the tag is about. The category is the
    // company's, so a tool takes only its label: every tool of a "data
    // provider" must not answer to "enrichment".
    searchText: searchTextOf(
      [
        data.name,
        company.name,
        data.summary,
        tagMap.get(`category:${company.category}`)?.label,
      ],
      tags.filter((key) => !key.startsWith('category:')),
      tagMap
    ),
  }
}

/** Why a tool file cannot be placed, or null when its path is fine. */
function toolPathProblem(
  file: ToolFile,
  companies: ReadonlyMap<string, Company>
): string | null {
  if (!companies.has(file.handle)) {
    return `companies/${file.handle}/ has no usable company.md`
  }
  if (
    !(
      isValidKeyPart(file.slug) &&
      isValidOwnedKey(`${file.handle}/${file.slug}`)
    )
  ) {
    return `"${file.slug}" is not a valid tool name: lowercase letters, digits and hyphens`
  }
  return null
}

/**
 * A generic operation several of a company's tools share — `stripe_api_read`
 * runs any GET — names nothing on its own. Each such call carries its tool's
 * API endpoint, so the file says what to pass: `stripe_api_read` with
 * `GET /v1/subscriptions`.
 */
function withEndpoints(tools: Map<string, Tool>): Map<string, Tool> {
  const uses = new Map<string, number>()
  const id = (tool: Tool, access: Access) =>
    `${tool.companyKey}|${access.type}|${access.operation}`
  for (const tool of tools.values()) {
    for (const access of tool.access) {
      uses.set(id(tool, access), (uses.get(id(tool, access)) ?? 0) + 1)
    }
  }
  return new Map(
    [...tools].map(([key, tool]) => {
      const api = tool.access.find((entry) => entry.type === 'api')
      if (!api) {
        return [key, tool]
      }
      const access = tool.access.map((entry) =>
        entry.type !== 'api' && (uses.get(id(tool, entry)) ?? 0) > 1
          ? { ...entry, endpoint: api.operation }
          : entry
      )
      return [key, { ...tool, access }]
    })
  )
}

export function buildTools(
  files: ReadonlyArray<ContentFile>,
  context: {
    companies: ReadonlyMap<string, Company>
    ways: ReadonlyMap<string, CompanyWays>
    tags: ReadonlyMap<string, Tag>
  },
  problems: ProblemList
): { tools: Map<string, Tool>; drafts: Set<string> } {
  const tools = new Map<string, Tool>()
  const drafts = new Set<string>()
  for (const file of files) {
    if (file.kind !== 'tool') {
      continue
    }
    const pathProblem = toolPathProblem(file, context.companies)
    if (pathProblem) {
      problems.add(file.path, pathProblem)
      continue
    }
    const parsed = parseFile(file, toolSchema, problems, RENDERED_ONLY)
    const company = context.companies.get(file.handle)
    if (!(parsed && company)) {
      continue
    }
    if (parsed.body) {
      problems.add(
        file.path,
        'a tool file ends at its header: say what the call does in `summary`, and what to know before calling in `notes`',
        parsed.bodyLine
      )
    }
    if (!context.tags.has(`capability:${parsed.data.capability}`)) {
      problems.add(
        file.path,
        `capability: "${parsed.data.capability}" is not in tags.yml — add it there in the same pull request if none fits`
      )
    }
    const access = resolveAccess(
      file,
      parsed.data,
      context.ways.get(file.handle) ?? {},
      problems
    )
    if (parsed.data.status === 'draft') {
      drafts.add(`${file.handle}/${file.slug}`)
    } else {
      const tool = toTool(file, parsed.data, company, context.tags, access)
      tools.set(tool.key, tool)
    }
  }
  return { tools: withEndpoints(tools), drafts }
}
