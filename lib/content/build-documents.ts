import { formatRef } from '@/lib/catalog/keys'
import {
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from '@/lib/catalog/render-markdown'
import type {
  CatalogDocument,
  Company,
  Tool,
  Workflow,
} from '@/lib/catalog/types'

/**
 * The rendered files, one per company, tool and workflow — THE product. This
 * is the one caller of the renderer; nothing renders on the request path and
 * nobody hand-edits a file. A file's `updated` date is the newest of its
 * inputs: a workflow file changes when a tool it uses changes its way in.
 */

export type DocumentInputs = {
  companies: ReadonlyMap<string, Company>
  tools: ReadonlyMap<string, Tool>
  workflows: ReadonlyMap<string, Workflow>
  toolsByCompany: ReadonlyMap<string, ReadonlyArray<string>>
}

export function buildDocuments(
  inputs: DocumentInputs
): Map<string, CatalogDocument> {
  const documents = new Map<string, CatalogDocument>()
  const put = (
    entityType: CatalogDocument['entityType'],
    key: string,
    updatedAt: number,
    rendered: { markdown: string; hash: string; lineCount: number }
  ) => {
    const ref = formatRef(entityType, key)
    documents.set(ref, { ref, entityType, updatedAt, ...rendered })
  }

  for (const tool of inputs.tools.values()) {
    put(
      'tool',
      tool.key,
      tool.updatedAt,
      renderToolDocument({
        key: tool.key,
        name: tool.name,
        companyKey: tool.companyKey,
        summary: tool.summary,
        ...(tool.description === undefined
          ? {}
          : { description: tool.description }),
        access: tool.access,
        agent: { level: tool.agent.level, reason: tool.agent.reason },
        updatedAt: tool.updatedAt,
      })
    )
  }

  for (const workflow of inputs.workflows.values()) {
    const tools = workflow.toolKeys.flatMap((key) => {
      const tool = inputs.tools.get(key)
      return tool ? [tool] : []
    })
    const updatedAt = Math.max(
      workflow.updatedAt,
      ...tools.map((tool) => tool.updatedAt)
    )
    put(
      'workflow',
      workflow.key,
      updatedAt,
      renderWorkflowDocument({
        key: workflow.key,
        version: workflow.version,
        title: workflow.title,
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
          ...(step.via ? { via: step.via } : {}),
          instruction: step.instruction,
        })),
        doneWhen: workflow.doneWhen,
        ...(workflow.notes === undefined ? {} : { notes: workflow.notes }),
        updatedAt,
      })
    )
  }

  for (const company of inputs.companies.values()) {
    const tools = (inputs.toolsByCompany.get(company.key) ?? []).flatMap(
      (key) => {
        const tool = inputs.tools.get(key)
        return tool?.status === 'published' ? [tool] : []
      }
    )
    const updatedAt = Math.max(
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
          agentLevel: tool.agent.level,
        })),
        updatedAt,
      })
    )
  }

  return documents
}
