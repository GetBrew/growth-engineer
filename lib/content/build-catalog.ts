import { isValidHandle } from '@/lib/catalog/keys'
import {
  accessSchema,
  type CompanyFrontmatter,
  companySchema,
} from '@/lib/schemas/content'
import type {
  CatalogDocument,
  Company,
  Relations,
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
import { buildRelations } from './build-relations'
import { buildTags } from './build-tags'
import { companyTags, dateToMs, searchTextOf } from './derive'
import { type ContentProblem, ProblemList } from './errors'
import { parseFile } from './parse-file'
import type { ContentFile } from './read-tree'

/**
 * Source files → the catalog. PURE: takes the files, returns the graph, and
 * throws ONE `ContentErrors` listing every problem it found — a contributor
 * fixes a pull request in one pass. Keys come from paths; references are
 * resolved here and in ./build-entities.ts; projections are computed in
 * ./derive.ts; the edges in ./build-relations.ts; the files an agent fetches
 * are rendered last, in ./build-documents.ts.
 */

export type Catalog = {
  /** Published and deprecated only — a draft has no page and no file. */
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  /** Curated tags from tags.yml plus the derived `has:*`. */
  tags: ReadonlyMap<string, Tag>
  /** By ref: `tool:clay/enrich-contacts`. */
  documents: ReadonlyMap<string, CatalogDocument>
  /** `${type}:${oldKey}` → the current key. */
  aliases: ReadonlyMap<string, string>
  /** By ref or tag key: what each entry is linked to (./build-relations.ts). */
  relations: ReadonlyMap<string, Relations>
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

function byKey<T extends { key: string }>(a: T, b: T): number {
  return a.key.localeCompare(b.key)
}

function newestFirst<T extends { key: string; updatedAt: number }>(
  a: T,
  b: T
): number {
  return b.updatedAt - a.updatedAt || a.key.localeCompare(b.key)
}

type CompanyFile = ContentFile & { kind: 'company' }

/** The company as its file states it; its tags and search text wait for its tools (assemble). */
function toCompany(
  file: CompanyFile,
  parsed: { data: CompanyFrontmatter; body: string }
): Company {
  const { data, body } = parsed
  return {
    key: file.handle,
    name: data.name,
    domain: data.domain,
    category: data.category,
    ...(data.tagline ? { tagline: data.tagline } : {}),
    ...(body ? { description: body } : {}),
    logo: { url: `/logos/${data.logo}` },
    links: {
      website: `https://${data.domain}`,
      ...(data.docs ? { docs: data.docs } : {}),
      ...(data.github ? { github: data.github } : {}),
    },
    status: data.status,
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    tags: [],
    searchText: '',
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
    if (!tags.has(`category:${parsed.data.category}`)) {
      problems.add(
        file.path,
        `category "${parsed.data.category}" is not in tags.yml`
      )
    }
    if (logos && !logos.has(parsed.data.logo)) {
      problems.add(
        file.path,
        `logo "${parsed.data.logo}" is not under public/logos/`
      )
    }
    companies.set(file.handle, toCompany(file, parsed))
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

/** Featured rank first (1 before 2), then the unranked, newest first. */
function featuredFirst(workflows: ReadonlyArray<Workflow>): Array<Workflow> {
  return [...workflows].sort(
    (a, b) =>
      (a.featured ?? Number.POSITIVE_INFINITY) -
        (b.featured ?? Number.POSITIVE_INFINITY) || newestFirst(a, b)
  )
}

/** A company's tags and search text, once its tools are known. */
function withTools(
  companies: ReadonlyMap<string, Company>,
  tools: ReadonlyMap<string, Tool>,
  tags: ReadonlyMap<string, Tag>
): Map<string, Company> {
  const published = [...tools.values()].filter(
    (tool) => tool.status === 'published'
  )
  return new Map(
    [...companies].map(([key, company]) => {
      const tagKeys = companyTags(
        company.category,
        published.filter((tool) => tool.companyKey === key)
      )
      const searchText = searchTextOf(
        [company.name, company.tagline, company.description],
        tagKeys,
        tags
      )
      return [key, { ...company, tags: tagKeys, searchText }]
    })
  )
}

/** The edges, the listing orders and the files, once every reference has resolved. */
function assemble(entities: {
  companies: Map<string, Company>
  tools: Map<string, Tool>
  workflows: Map<string, Workflow>
  tags: Map<string, Tag>
  aliases: Map<string, string>
}): Catalog {
  const { tools, workflows, tags, aliases } = entities
  const companies = withTools(entities.companies, tools, tags)
  const published = <T extends { status: 'published' | 'deprecated' }>(
    values: Iterable<T>
  ) => [...values].filter((entity) => entity.status === 'published')
  const order = {
    toolsNew: published(tools.values())
      .sort(newestFirst)
      .map((tool) => tool.key),
    workflowsFeatured: featuredFirst(published(workflows.values())).map(
      (workflow) => workflow.key
    ),
    workflowsNew: published(workflows.values())
      .sort(newestFirst)
      .map((workflow) => workflow.key),
    companies: published(companies.values())
      .sort((a, b) => a.name.localeCompare(b.name) || byKey(a, b))
      .map((company) => company.key),
  }
  const relations = buildRelations({
    companies,
    tools,
    workflows,
    tags,
    order,
  })
  return {
    companies,
    tools,
    workflows,
    tags,
    documents: buildDocuments({ companies, tools, workflows, relations }),
    aliases,
    relations,
    order,
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
