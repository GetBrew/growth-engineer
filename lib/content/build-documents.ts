import { TAG_NAMESPACE_MEANINGS } from '@/lib/catalog/definitions'
import { formatRef, refToSourcePath } from '@/lib/catalog/keys'
import { selectWorkflowAccess } from '@/lib/catalog/render-access'
import {
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from '@/lib/catalog/render-markdown'
import { renderTagDocument } from '@/lib/catalog/render-tag'
import type {
  Access,
  CatalogDocument,
  Company,
  Relations,
  Tag,
  TagDocument,
  Tool,
  Workflow,
} from '@/lib/types/catalog'

/**
 * The rendered files, one per company, tool and workflow — THE product. This
 * is the one caller of the renderer; nothing renders on the request path and
 * nobody hand-edits a file.
 *
 * A file's `updated` date is the newest `updated` of every file that fed it,
 * from the ENTITY dates (never another file's date, so nothing loops):
 *   tool      the tool, its company (its ways in), the workflows that use it
 *   workflow  the workflow, its tools, their companies
 *   company   the company, its tools
 * So editing Stripe's MCP URL moves the date of every file that shows it.
 *
 * Each file also lists the SOURCE files it was rendered from (`sources`), for
 * the "Built from" links: its own file, then every tool file and company file
 * (where the ways in live) whose facts it prints.
 */

function newest(...dates: ReadonlyArray<number>): number {
  return Math.max(...dates)
}

export type DocumentInputs = {
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  relations: ReadonlyMap<string, Relations>
}

/** A tool's file, then its company's when the file prints a way in from it. */
function toolFiles(tool: Tool, access: ReadonlyArray<Access>): Array<string> {
  return [
    refToSourcePath({ type: 'tool', key: tool.key }),
    ...(access.length > 0
      ? [refToSourcePath({ type: 'company', key: tool.companyKey })]
      : []),
  ]
}

/**
 * What a workflow file prints: the workflow's own file, then for each tool in
 * first-use order its file and, when its setup shows a way in, its company's.
 */
function workflowSources(
  workflow: Workflow,
  tools: ReadonlyArray<Tool>
): Array<string> {
  return [
    refToSourcePath({ type: 'workflow', key: workflow.key }),
    ...tools.flatMap((tool) =>
      toolFiles(tool, selectWorkflowAccess(tool.access))
    ),
  ]
}

export function buildDocuments(
  inputs: DocumentInputs
): Map<string, CatalogDocument> {
  const documents = new Map<string, CatalogDocument>()
  const put = (
    entityType: CatalogDocument['entityType'],
    key: string,
    updatedAt: number,
    rendered: { markdown: string; lineCount: number },
    sources: ReadonlyArray<string>
  ) => {
    const ref = formatRef(entityType, key)
    documents.set(ref, {
      ref,
      entityType,
      updatedAt,
      ...rendered,
      sources: [...new Set(sources)],
    })
  }

  const companyDate = (companyKey: string) =>
    inputs.companies.get(companyKey)?.updatedAt ?? 0
  const workflows = [...inputs.workflows.values()]

  for (const tool of inputs.tools.values()) {
    const updatedAt = newest(
      tool.updatedAt,
      companyDate(tool.companyKey),
      ...workflows
        .filter((workflow) => workflow.toolKeys.includes(tool.key))
        .map((workflow) => workflow.updatedAt)
    )
    put(
      'tool',
      tool.key,
      updatedAt,
      renderToolDocument({
        key: tool.key,
        name: tool.name,
        companyKey: tool.companyKey,
        workflows:
          inputs.relations.get(formatRef('tool', tool.key))?.workflows ?? [],
        tags: tool.tags,
        summary: tool.summary,
        ...(tool.description === undefined
          ? {}
          : { description: tool.description }),
        ...(tool.docs === undefined ? {} : { docs: tool.docs }),
        access: tool.access,
        isDeprecated: tool.status === 'deprecated',
        updatedAt,
      }),
      toolFiles(tool, tool.access)
    )
  }

  for (const workflow of inputs.workflows.values()) {
    const tools = workflow.toolKeys.flatMap((key) => {
      const tool = inputs.tools.get(key)
      return tool ? [tool] : []
    })
    const updatedAt = newest(
      workflow.updatedAt,
      ...tools.flatMap((tool) => [tool.updatedAt, companyDate(tool.companyKey)])
    )
    put(
      'workflow',
      workflow.key,
      updatedAt,
      renderWorkflowDocument({
        key: workflow.key,
        title: workflow.title,
        author: workflow.author,
        tools: tools.map((tool) => ({
          key: tool.key,
          name: tool.name,
          companyName:
            inputs.companies.get(tool.companyKey)?.name ?? tool.companyKey,
          access: tool.access,
        })),
        tags: [...workflow.tags].sort(),
        inputs: workflow.inputs,
        steps: workflow.steps.map((step) => ({
          title: step.title,
          toolKey: step.toolKey,
          instruction: step.instruction,
        })),
        doneWhen: workflow.doneWhen,
        ...(workflow.notes === undefined ? {} : { notes: workflow.notes }),
        isDeprecated: workflow.status === 'deprecated',
        updatedAt,
      }),
      workflowSources(workflow, tools)
    )
  }

  for (const company of inputs.companies.values()) {
    const tools = (
      inputs.relations.get(formatRef('company', company.key))?.tools ?? []
    ).flatMap((key) => {
      const tool = inputs.tools.get(key)
      return tool ? [tool] : []
    })
    const updatedAt = newest(
      company.updatedAt,
      ...[...inputs.tools.values()]
        .filter((tool) => tool.companyKey === company.key)
        .map((tool) => tool.updatedAt)
    )
    put(
      'company',
      company.key,
      updatedAt,
      renderCompanyDocument({
        key: company.key,
        name: company.name,
        tags: company.tags,
        ...(company.tagline === undefined ? {} : { tagline: company.tagline }),
        ...(company.description === undefined
          ? {}
          : { description: company.description }),
        links: {
          ...(company.links.website ? { website: company.links.website } : {}),
          ...(company.links.docs ? { docs: company.links.docs } : {}),
        },
        tools: tools.map((tool) => ({
          key: tool.key,
          name: tool.name,
          summary: tool.summary,
        })),
        isDeprecated: company.status === 'deprecated',
        updatedAt,
      }),
      [
        refToSourcePath({ type: 'company', key: company.key }),
        ...tools.map((tool) =>
          refToSourcePath({ type: 'tool', key: tool.key })
        ),
      ]
    )
  }

  return documents
}

const FIRST_SENTENCE = /^[^.!?]+[.!?]/

/** A company in one line: its tagline, else its description's first sentence. */
function companySummary(company: Company): string {
  const sentence = company.description
    ? (FIRST_SENTENCE.exec(company.description.trim())?.[0] ?? '')
    : ''
  return company.tagline ?? sentence.trim()
}

/**
 * Every tag's file: its published members, as the listings and MCP `search`
 * count them (./build-relations.ts). Dated like the newest member's file; a
 * tag nothing carries yet takes the catalog's newest date.
 */
export function buildTagDocuments(inputs: {
  tags: ReadonlyMap<string, Tag>
  relations: ReadonlyMap<string, Relations>
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  documents: ReadonlyMap<string, CatalogDocument>
}): Map<string, TagDocument> {
  const { companies, tools, workflows, documents } = inputs
  const dateOf = (ref: string) => documents.get(ref)?.updatedAt ?? 0
  const catalogDate = Math.max(
    0,
    ...[...documents.values()].map((document) => document.updatedAt)
  )
  const tagDocuments = new Map<string, TagDocument>()
  for (const tag of inputs.tags.values()) {
    const members = inputs.relations.get(tag.key)
    const memberTools = (members?.tools ?? []).flatMap((key) => {
      const tool = tools.get(key)
      return tool ? [tool] : []
    })
    const memberWorkflows = (members?.workflows ?? []).flatMap((key) => {
      const workflow = workflows.get(key)
      return workflow ? [workflow] : []
    })
    const memberCompanies = (members?.companies ?? []).flatMap((key) => {
      const company = companies.get(key)
      return company ? [company] : []
    })
    const dates = [
      ...memberTools.map((tool) => dateOf(formatRef('tool', tool.key))),
      ...memberWorkflows.map((workflow) =>
        dateOf(formatRef('workflow', workflow.key))
      ),
      ...memberCompanies.map((company) =>
        dateOf(formatRef('company', company.key))
      ),
    ]
    const rendered = renderTagDocument({
      key: tag.key,
      label: tag.label,
      meaning: TAG_NAMESPACE_MEANINGS[tag.namespace],
      synonyms: tag.synonyms,
      tools: memberTools.map((tool) => ({
        key: tool.key,
        name: tool.name,
        companyName: companies.get(tool.companyKey)?.name ?? tool.companyKey,
        summary: tool.summary,
      })),
      workflows: memberWorkflows.map((workflow) => ({
        key: workflow.key,
        title: workflow.title,
        summary: workflow.summary,
      })),
      companies: memberCompanies.map((company) => ({
        key: company.key,
        name: company.name,
        summary: companySummary(company),
      })),
      updatedAt: dates.length > 0 ? Math.max(...dates) : catalogDate,
    })
    tagDocuments.set(tag.key, {
      key: tag.key,
      ...rendered,
      updatedAt: dates.length > 0 ? Math.max(...dates) : catalogDate,
    })
  }
  return tagDocuments
}
