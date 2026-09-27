import { formatRef } from '@/lib/catalog/keys'
import {
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from '@/lib/catalog/render-markdown'
import type {
  CatalogDocument,
  Company,
  Relations,
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
    documents.set(ref, { ref, entityType, updatedAt, ...rendered })
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
        updatedAt,
      })
    )
  }

  return documents
}
