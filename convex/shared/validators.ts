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

/** The public tool fields needed by directories and compact home lists. */
export const toolListSummary = v.object({
  _id: v.id('tools'),
  key: v.string(),
  name: v.string(),
  summary: v.string(),
  agentLevel: v.union(
    v.literal('unverified'),
    v.literal('native'),
    v.literal('friendly'),
    v.literal('possible')
  ),
  access: v.array(
    v.union(v.literal('mcp'), v.literal('cli'), v.literal('api'))
  ),
})

/** What a list card needs from a tool and the company that owns it. */
export const toolCard = v.object({
  tool: toolListSummary,
  company: v.object({
    key: v.string(),
    name: v.string(),
    logoUrl: v.optional(v.string()),
  }),
  category: v.optional(v.object({ slug: v.string(), label: v.string() })),
})

/** The public company fields needed by directories and compact home lists. */
export const companyListSummary = v.object({
  _id: v.id('companies'),
  key: v.string(),
  name: v.string(),
  tagline: v.optional(v.string()),
  description: v.optional(v.string()),
  domain: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
})

export const companyRow = v.object({
  company: companyListSummary,
  category: v.optional(v.object({ slug: v.string(), label: v.string() })),
  access: v.array(
    v.union(v.literal('mcp'), v.literal('cli'), v.literal('api'))
  ),
})

/** What a list row needs from a workflow: the workflow plus its tools' identities. */

export const workflowSummary = v.object({
  _id: v.id('workflows'),
  key: v.string(),
  title: v.string(),
  summary: v.optional(v.string()),
  format: v.union(v.literal('hack'), v.literal('workflow')),
  toolCount: v.number(),
})

export const workflowRow = v.object({
  workflow: workflowSummary,
  tools: v.array(
    v.object({
      companyKey: v.string(),
      companyName: v.string(),
      logoUrl: v.optional(v.string()),
      access: v.array(
        v.union(v.literal('mcp'), v.literal('cli'), v.literal('api'))
      ),
    })
  ),
})

export const nullableCompanyDoc = nullable(companyDoc)
export const nullableDocumentDoc = nullable(documentDoc)
