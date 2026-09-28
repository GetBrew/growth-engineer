import type {
  CatalogDocument,
  Company,
  Relations,
  Tag,
  TagDocument,
  Tool,
  Workflow,
} from '@/lib/types/catalog'
import { buildAliases } from './build-aliases'
import { buildCompanies } from './build-companies'
import { buildDocuments, buildTagDocuments } from './build-documents'
import { buildRelations } from './build-relations'
import { buildTags } from './build-tags'
import { buildTools } from './build-tools'
import { buildWorkflows } from './build-workflows'
import { companyTags, searchTextOf } from './derive'
import { type ContentProblem, ProblemList } from './errors'
import type { ContentFile, LogoExtension } from './read-tree'

/**
 * Source files → the catalog. PURE: takes the files, returns the graph, and
 * throws ONE `ContentErrors` listing every problem it found — a contributor
 * fixes a pull request in one pass. Keys come from paths; each kind is
 * parsed and resolved in its own builder (./build-tags.ts,
 * ./build-companies.ts, ./build-tools.ts, ./build-workflows.ts); projections
 * are computed in ./derive.ts; the edges in ./build-relations.ts; the files
 * an agent fetches are rendered last, in ./build-documents.ts.
 */

export type Catalog = {
  /** Companies with a tool that is not a draft; tools and workflows are published or deprecated — a draft has no page and no file. */
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  /** Curated tags from tags.yml plus the derived `has:*`. */
  tags: ReadonlyMap<string, Tag>
  /** By ref: `tool:apollo/enrich-person`. */
  documents: ReadonlyMap<string, CatalogDocument>
  /** By tag key: `capability:enrich-contacts` → its file (./build-documents.ts). */
  tagDocuments: ReadonlyMap<string, TagDocument>
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
  /** Each company's logo, by handle (`companies/<handle>/logo.<ext>`). */
  logos?: ReadonlyMap<string, LogoExtension>
  /** Problems the tree walk found before parsing started. */
  problems?: ReadonlyArray<ContentProblem>
}

function byKey<T extends { key: string }>(a: T, b: T): number {
  return a.key.localeCompare(b.key)
}

function newestFirst<T extends { key: string; updatedAt: number }>(
  a: T,
  b: T
): number {
  return b.updatedAt - a.updatedAt || a.key.localeCompare(b.key)
}

/** Featured workflows first, then the rest; newest first within each. */
function featuredFirst(workflows: ReadonlyArray<Workflow>): Array<Workflow> {
  return [...workflows].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || newestFirst(a, b)
  )
}

/**
 * A company has a page and a file once it has a tool that is not a draft;
 * until then it is a folder waiting for its first function.
 */
function withAnyTool(
  companies: ReadonlyMap<string, Company>,
  tools: ReadonlyMap<string, Tool>
): Map<string, Company> {
  const makers = new Set([...tools.values()].map((tool) => tool.companyKey))
  return new Map([...companies].filter(([key]) => makers.has(key)))
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
    // Listed: published, with at least one published tool to show.
    companies: published(companies.values())
      .filter((company) =>
        published(tools.values()).some(
          (tool) => tool.companyKey === company.key
        )
      )
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
  const documents = buildDocuments({ companies, tools, workflows, relations })
  return {
    companies,
    tools,
    workflows,
    tags,
    documents,
    tagDocuments: buildTagDocuments({
      tags,
      relations,
      companies,
      tools,
      workflows,
      documents,
    }),
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
  const { companies, ways } = buildCompanies(
    files,
    tags,
    options.logos ?? new Map(),
    problems
  )
  const { tools, drafts } = buildTools(
    files,
    { companies, ways, tags },
    problems
  )
  const workflows = buildWorkflows(files, { tools, drafts, tags }, problems)
  const aliases = buildAliases(
    { companies, tools, workflows: workflows.workflows },
    { tool: drafts, workflow: workflows.drafts },
    problems
  )
  problems.throwIfAny()
  const paged = withAnyTool(companies, tools)
  return assemble({
    companies: paged,
    tools,
    workflows: workflows.workflows,
    tags,
    // A company whose tools are all drafts has no page: its old keys have
    // nowhere to redirect.
    aliases: new Map(
      [...aliases].filter(
        ([ref, key]) => !ref.startsWith('company:') || paged.has(key)
      )
    ),
  })
}
