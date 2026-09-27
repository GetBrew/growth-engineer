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
 * a way plus a call is one `Access`. Every miss is a problem with a file
 * path, never a crash.
 */

type ToolFile = ContentFile & { kind: 'tool' }

const WAYS: ReadonlyArray<AccessType> = ['mcp', 'cli', 'api']

/** Header fields that no longer exist, and what to write instead. */
const RETIRED_FIELDS = {
  access:
    'calls are top-level now: `mcp: <tool name>`, `cli: <command>`, `api: METHOD /path`',
}

type Way = NonNullable<CompanyWays[AccessType]>

function authOf(way: Way): Auth {
  if (way.auth === 'api_key') {
    return {
      method: 'api_key',
      envVar: way.env ?? '',
      ...('header' in way && way.header ? { header: way.header } : {}),
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
  const tags = toolTags(
    { capability: data.capability, access },
    company.category
  )
  return {
    key: `${file.handle}/${file.slug}`,
    companyKey: file.handle,
    name: data.name,
    summary: data.summary,
    ...(body ? { description: body } : {}),
    capability: data.capability,
    ...(data.docs ? { docs: data.docs } : {}),
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

export function buildTools(
  files: ReadonlyArray<ContentFile>,
  context: {
    companies: ReadonlyMap<string, Company>
    ways: ReadonlyMap<string, CompanyWays>
    tags: ReadonlyMap<string, Tag>
  },
  problems: ProblemList
): Map<string, Tool> {
  const tools = new Map<string, Tool>()
  for (const file of files) {
    if (file.kind !== 'tool') {
      continue
    }
    const pathProblem = toolPathProblem(file, context.companies)
    if (pathProblem) {
      problems.add(file.path, pathProblem)
      continue
    }
    const parsed = parseFile(file, toolSchema, problems, RETIRED_FIELDS)
    const company = context.companies.get(file.handle)
    if (!(parsed && company)) {
      continue
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
    if (parsed.data.status !== 'draft') {
      const tool = toTool(file, parsed, company, context.tags, access)
      tools.set(tool.key, tool)
    }
  }
  return tools
}
