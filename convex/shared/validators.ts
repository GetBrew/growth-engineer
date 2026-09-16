import { v } from 'convex/values'
import { doc, nullable } from 'convex-helpers/validators'
import schema from '../schema'

/**
 * Return validators shared by the public queries. A declared `returns` is what
 * makes a handler that drifts fail `tsc` instead of a page; declaring the
 * document shapes once here keeps the queries short and the drift visible.
 */

export const companyDoc = doc(schema, 'companies')
export const toolDoc = doc(schema, 'tools')
export const workflowDoc = doc(schema, 'workflows')
export const workflowVersionDoc = doc(schema, 'workflowVersions')
export const tagDoc = doc(schema, 'tags')
export const documentDoc = doc(schema, 'documents')

/** What a list card needs from a tool: the tool plus its company's identity. */
export const toolCard = v.object({
  tool: toolDoc,
  company: v.object({
    key: v.string(),
    name: v.string(),
    logoUrl: v.optional(v.string()),
  }),
})

/** What a list row needs from a workflow: the workflow plus its tools' identities. */
export const workflowRow = v.object({
  workflow: workflowDoc,
  tools: v.array(
    v.object({
      key: v.string(),
      name: v.string(),
      companyKey: v.string(),
      logoUrl: v.optional(v.string()),
    })
  ),
})

export const nullableCompanyDoc = nullable(companyDoc)
export const nullableDocumentDoc = nullable(documentDoc)
