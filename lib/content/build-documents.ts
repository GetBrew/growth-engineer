import { TAG_NAMESPACE_MEANINGS } from '@/lib/catalog/definitions'
import { formatRef } from '@/lib/catalog/keys'
import {
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from '@/lib/catalog/render-markdown'
import { renderTagDocument } from '@/lib/catalog/render-tag'
import type {
  CatalogDocument,
  Company,
  Relations,
  Tag,
  TagDocument,
  Tool,
  Workflow,
} from '@/lib/types/catalog'
import { companySummary } from './derive'

/**
 * The rendered files, one per company, tool and workflow — THE product. This
 * is the one caller of the renderer; nothing renders on the request path and
 * nobody hand-edits a file.
 *
 * A file's `updated` date is the newest `updated` of every file that fed it,
 * from the ENTITY dates (never another file's date, so nothing loops):
 *   tool      the tool, its company (its ways in), the published workflows
 *             that use it (the ones its file lists)
 *   workflow  the workflow, its tools, their companies
 *   company   the company, its published tools (the ones its file lists)
 * So editing Stripe's MCP URL moves the date of every file that shows it.
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

export function buildDocuments(
  inputs: DocumentInputs
): Map<string, CatalogDocument> {
  const documents = new Map<string, CatalogDocument>()
  const put = (
    entityType: CatalogDocument['entityType'],
    key: string,
    updatedAt: number,
    rendered: { markdown: string; lineCount: number }
  ) => {
    const ref = formatRef(entityType, key)
    documents.set(ref, {
      ref,
      entityType,
      updatedAt,
      ...rendered,
    })
  }

  const companyDate = (companyKey: string) =>
    inputs.companies.get(companyKey)?.updatedAt ?? 0

  for (const tool of inputs.tools.values()) {
    const updatedAt = newest(
      tool.updatedAt,
      companyDate(tool.companyKey),
      ...(
        inputs.relations.get(formatRef('tool', tool.key))?.workflows ?? []
      ).map((key) => inputs.workflows.get(key)?.updatedAt ?? 0)
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
        ...(tool.docs === undefined ? {} : { docs: tool.docs }),
        access: tool.access,
        isDeprecated: tool.status === 'deprecated',
        updatedAt,
      })
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
      })
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
      ...tools.map((tool) => tool.updatedAt)
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
      })
    )
  }

  return documents
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
