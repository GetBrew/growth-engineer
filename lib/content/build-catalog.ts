import { DERIVED_TAGS } from '@/lib/catalog/derived-tags'
import {
  DERIVED_TAG_NAMESPACES,
  isValidHandle,
  isValidKeyPart,
  TAG_NAMESPACES,
  type TagNamespace,
} from '@/lib/catalog/keys'
import {
  accessSchema,
  type CompanyFrontmatter,
  companySchema,
  tagSchema,
} from '@/lib/schemas/content'
import type {
  CatalogDocument,
  Company,
  Tag,
  Tool,
  Workflow,
} from '@/lib/types/catalog'
import { buildAliases } from './build-aliases'
import { buildDocuments } from './build-documents'
import {
  type AccessOptions,
  buildTools,
  buildWorkflows,
} from './build-entities'
import { companySearchText, dateToMs, tagCounts } from './derive'
import { type ContentProblem, ProblemList } from './errors'
import { parseFile } from './parse-file'
import type { ContentFile } from './read-tree'

/**
 * Source files → the catalog. PURE: takes the files, returns the graph, and
 * throws ONE `ContentErrors` listing every problem it found — a contributor
 * fixes a pull request in one pass. Keys come from paths; references are
 * resolved here and in ./build-entities.ts; projections are computed in
 * ./derive.ts; the files an agent fetches are rendered last, in
 * ./build-documents.ts.
 */

export type Catalog = {
  /** Published and deprecated only — a draft has no page and no file. */
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  /** Curated tags from tags/ plus the derived `has:*`. */
  tags: ReadonlyMap<string, Tag>
  /** By ref: `tool:clay/enrich-contacts`. */
  documents: ReadonlyMap<string, CatalogDocument>
  /** `${type}:${oldKey}` → the current key. */
  aliases: ReadonlyMap<string, string>
  toolsByCompany: ReadonlyMap<string, ReadonlyArray<string>>
  workflowsByTool: ReadonlyMap<string, ReadonlyArray<string>>
  workflowsByCompany: ReadonlyMap<string, ReadonlyArray<string>>
  /** Listing orders, published entities only. */
  order: {
    toolsNew: ReadonlyArray<string>
    workflowsFeatured: ReadonlyArray<string>
    workflowsNew: ReadonlyArray<string>
    companies: ReadonlyArray<string>
  }
}

export type BuildOptions = {
  /** File names under public/logos; when given, every company logo must exist. */
  logos?: ReadonlySet<string>
  /** Problems the tree walk found before parsing started. */
  problems?: ReadonlyArray<ContentProblem>
}

const ACCESS_ID = /^[a-z0-9][a-z0-9-]*$/
const CURATED_NAMESPACES = TAG_NAMESPACES.filter(
  (namespace) => !DERIVED_TAG_NAMESPACES.has(namespace)
)

function byKey<T extends { key: string }>(a: T, b: T): number {
  return a.key.localeCompare(b.key)
}

function newestFirst<T extends { key: string; updatedAt: number }>(
  a: T,
  b: T
): number {
  return b.updatedAt - a.updatedAt || a.key.localeCompare(b.key)
}

function emptyCounts(): Tag['counts'] {
  return { companies: 0, tools: 0, workflows: 0 }
}

/** Why a tag file cannot be accepted, or null when its path is fine. */
function tagPathProblem(file: ContentFile & { kind: 'tag' }): string | null {
  if (DERIVED_TAG_NAMESPACES.has(file.namespace as TagNamespace)) {
    return `${file.namespace}:* tags are computed from each tool's access, never written as files`
  }
  if (!(CURATED_NAMESPACES as ReadonlyArray<string>).includes(file.namespace)) {
    return `unknown namespace "${file.namespace}"; tags live under ${CURATED_NAMESPACES.join(', ')}`
  }
  if (!isValidKeyPart(file.slug)) {
    return `"${file.slug}" is not a valid slug`
  }
  return null
}

function buildTags(
  files: ReadonlyArray<ContentFile>,
  problems: ProblemList
): Map<string, Tag> {
  const tags = new Map<string, Tag>()
  for (const file of files) {
    if (file.kind !== 'tag') {
      continue
    }
    const pathProblem = tagPathProblem(file)
    if (pathProblem) {
      problems.add(file.path, pathProblem)
      continue
    }
    const parsed = parseFile(file, tagSchema, problems)
    if (!parsed) {
      continue
    }
    if (!parsed.body) {
      problems.add(
        file.path,
        'describe the tag in one sentence under the header'
      )
      continue
    }
    const key = `${file.namespace}:${file.slug}`
    tags.set(key, {
      key,
      namespace: file.namespace as TagNamespace,
      slug: file.slug,
      label: parsed.data.label,
      synonyms: parsed.data.synonyms,
      description: parsed.body,
      derived: false,
      counts: emptyCounts(),
    })
  }
  for (const derived of DERIVED_TAGS) {
    const key = `${derived.namespace}:${derived.slug}`
    tags.set(key, { ...derived, key, derived: true, counts: emptyCounts() })
  }
  return tags
}

type CompanyFile = ContentFile & { kind: 'company' }

function toCompany(
  file: CompanyFile,
  parsed: { data: CompanyFrontmatter; body: string },
  category: Tag | undefined
): Company {
  const { data, body } = parsed
  return {
    key: file.handle,
    name: data.name,
    kind: data.kind,
    domain: data.domain,
    category: data.category,
    ...(data.tagline ? { tagline: data.tagline } : {}),
    ...(body ? { description: body } : {}),
    logo: { url: `/logos/${data.logo}` },
    links: {
      website: data.website ?? `https://${data.domain}`,
      ...(data.docs ? { docs: data.docs } : {}),
      ...(data.github ? { github: data.github } : {}),
      ...(data.linkedin ? { linkedin: data.linkedin } : {}),
      ...(data.x ? { x: data.x } : {}),
    },
    ...(data.founded ? { founded: data.founded } : {}),
    ...(data.headquarters ? { headquarters: data.headquarters } : {}),
    status: data.status,
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    searchText: companySearchText(
      { ...data, ...(body ? { description: body } : {}) },
      category
    ),
  }
}

function buildCompanies(
  files: ReadonlyArray<ContentFile>,
  tags: ReadonlyMap<string, Tag>,
  logos: ReadonlySet<string> | undefined,
  problems: ProblemList
): Map<string, Company> {
  const companies = new Map<string, Company>()
  for (const file of files) {
    if (file.kind !== 'company') {
      continue
    }
    if (!isValidHandle(file.handle)) {
      problems.add(
        file.path,
        `"${file.handle}" is not a usable handle: lowercase letters, digits and hyphens, and not a reserved word`
      )
      continue
    }
    const parsed = parseFile(file, companySchema, problems)
    if (!parsed) {
      continue
    }
    const category = tags.get(`category:${parsed.data.category}`)
    if (!category) {
      problems.add(
        file.path,
        `category "${parsed.data.category}" is not a file under tags/category/`
      )
    }
    if (logos && !logos.has(parsed.data.logo)) {
      problems.add(
        file.path,
        `logo "${parsed.data.logo}" is not under public/logos/`
      )
    }
    companies.set(file.handle, toCompany(file, parsed, category))
  }
  return companies
}

function buildAccessOptions(
  files: ReadonlyArray<ContentFile>,
  companyFolders: ReadonlySet<string>,
  problems: ProblemList
): AccessOptions {
  const options: AccessOptions = new Map()
  for (const file of files) {
    if (file.kind !== 'access') {
      continue
    }
    if (!companyFolders.has(file.handle)) {
      problems.add(file.path, `companies/${file.handle}/ has no company.md`)
      continue
    }
    if (!ACCESS_ID.test(file.id)) {
      problems.add(
        file.path,
        `"${file.id}" is not a valid access id: lowercase letters, digits and hyphens (mcp, cli, api, mcp-community…)`
      )
      continue
    }
    const parsed = parseFile(file, accessSchema, problems)
    if (!parsed) {
      continue
    }
    const forCompany = options.get(file.handle) ?? new Map()
    forCompany.set(file.id, parsed.data)
    options.set(file.handle, forCompany)
  }
  return options
}

function groupKeys<T extends { key: string }>(
  entities: Iterable<T>,
  by: (entity: T) => ReadonlyArray<string>
): Map<string, Array<string>> {
  const groups = new Map<string, Array<string>>()
  for (const entity of entities) {
    for (const group of by(entity)) {
      groups.set(group, [...(groups.get(group) ?? []), entity.key])
    }
  }
  return groups
}

/** Featured rank first (1 before 2), then the unranked, newest first. */
function featuredFirst(workflows: ReadonlyArray<Workflow>): Array<Workflow> {
  return [...workflows].sort(
    (a, b) =>
      (a.featured ?? Number.POSITIVE_INFINITY) -
        (b.featured ?? Number.POSITIVE_INFINITY) || newestFirst(a, b)
  )
}

/** The edges and listing orders, once every reference has resolved. */
function assemble(entities: {
  companies: Map<string, Company>
  tools: Map<string, Tool>
  workflows: Map<string, Workflow>
  tags: Map<string, Tag>
  aliases: Map<string, string>
}): Catalog {
  const { companies, tools, workflows, tags, aliases } = entities
  const published = <T extends { status: 'published' | 'deprecated' }>(
    values: Iterable<T>
  ) => [...values].filter((entity) => entity.status === 'published')
  const featured = featuredFirst(published(workflows.values()))
  const toolsByCompany = groupKeys([...tools.values()].sort(byKey), (tool) => [
    tool.companyKey,
  ])
  const workflowsByTool = groupKeys(featured, (workflow) => workflow.toolKeys)
  tagCounts(tags, companies.values(), tools.values(), workflows.values())
  return {
    companies,
    tools,
    workflows,
    tags,
    documents: buildDocuments({
      companies,
      tools,
      workflows,
      toolsByCompany,
      workflowsByTool,
    }),
    aliases,
    toolsByCompany,
    workflowsByTool,
    workflowsByCompany: groupKeys(featured, (workflow) => [
      ...new Set(
        workflow.toolKeys.map((key) => tools.get(key)?.companyKey ?? '')
      ),
    ]),
    order: {
      toolsNew: published(tools.values())
        .sort(newestFirst)
        .map((tool) => tool.key),
      workflowsFeatured: featured.map((workflow) => workflow.key),
      workflowsNew: published(workflows.values())
        .sort(newestFirst)
        .map((workflow) => workflow.key),
      companies: published(companies.values())
        .sort((a, b) => a.name.localeCompare(b.name) || byKey(a, b))
        .map((company) => company.key),
    },
  }
}

export function buildCatalog(
  files: ReadonlyArray<ContentFile>,
  options: BuildOptions = {}
): Catalog {
  const problems = new ProblemList()
  for (const problem of options.problems ?? []) {
    problems.add(problem.file, problem.message)
  }
  const tags = buildTags(files, problems)
  const companies = buildCompanies(files, tags, options.logos, problems)
  const companyFolders = new Set(
    files.flatMap((file) => (file.kind === 'company' ? [file.handle] : []))
  )
  const accessOptions = buildAccessOptions(files, companyFolders, problems)
  const tools = buildTools(
    files,
    { companies, companyFolders, accessOptions, tags },
    problems
  )
  const workflows = buildWorkflows(files, { tools, tags }, problems)
  const aliases = buildAliases({ companies, tools, workflows }, problems)
  problems.throwIfAny()
  return assemble({ companies, tools, workflows, tags, aliases })
}
