import { formatRef, refToSourcePath } from '@/lib/catalog/keys'
import { orderAccess, selectWorkflowAccess } from '@/lib/catalog/render-access'
import {
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
} from '@/lib/catalog/render-markdown'
import type {
  Access,
  CatalogDocument,
  Company,
  Tool,
  Workflow,
} from '@/lib/types/catalog'

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
  workflowsByTool: ReadonlyMap<string, ReadonlyArray<string>>
}

/** The access files a list of ways in was read from, in that order. */
function accessFiles(access: ReadonlyArray<Access>): Array<string> {
  return access.flatMap((entry) => (entry.file ? [entry.file] : []))
}

/**
 * What a tool file prints: the tool's own file, then every way in (a tool
 * file lists them all, in setup order).
 */
function toolSources(tool: Tool): Array<string> {
  return [
    refToSourcePath({ type: 'tool', key: tool.key }),
    ...accessFiles(orderAccess(tool.access)),
  ]
}

/**
 * What a workflow file prints: the workflow's own file, then for each tool in
 * first-use order its file and ONLY the ways in its setup shows — the step's
 * `via`, else the best one or two — exactly as the renderer selects them.
 */
function workflowSources(
  workflow: Workflow,
  tools: ReadonlyArray<Tool>
): Array<string> {
  return [
    refToSourcePath({ type: 'workflow', key: workflow.key }),
    ...tools.flatMap((tool) => {
      const via = workflow.steps.find(
        (step) => step.toolKey === tool.key && step.via
      )?.via
      return [
        refToSourcePath({ type: 'tool', key: tool.key }),
        ...accessFiles(selectWorkflowAccess(tool.access, via)),
      ]
    }),
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
    rendered: { markdown: string; hash: string; lineCount: number },
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

  for (const tool of inputs.tools.values()) {
    put(
      'tool',
      tool.key,
      tool.updatedAt,
      renderToolDocument({
        key: tool.key,
        name: tool.name,
        companyKey: tool.companyKey,
        workflows: inputs.workflowsByTool.get(tool.key) ?? [],
        summary: tool.summary,
        ...(tool.description === undefined
          ? {}
          : { description: tool.description }),
        access: tool.access,
        updatedAt: tool.updatedAt,
      }),
      toolSources(tool)
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
          ...(step.via ? { via: step.via } : {}),
          instruction: step.instruction,
        })),
        doneWhen: workflow.doneWhen,
        ...(workflow.notes === undefined ? {} : { notes: workflow.notes }),
        updatedAt,
      }),
      workflowSources(workflow, tools)
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
        })),
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
