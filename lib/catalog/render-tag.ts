import { formatRef } from './keys'
import { yamlList, yamlScalar } from './render-header'
import type { RenderedDocument } from './render-markdown'

/**
 * A TAG's file: `/tags/capability/enrich-contacts.md`. One job, one kind of
 * company, one channel, motion or way in — and everything published that
 * carries it, side by side, so an agent can compare every vendor's version of
 * a job from one fetch and then get the one to run. MCP `get` on a tag key
 * returns this file.
 *
 * PURE MODULE, like ./render-markdown.ts: rendered at build from the tag and
 * its members; nothing renders per request.
 */

export type TagFileInput = {
  /** `capability:enrich-contacts` */
  key: string
  label: string
  /** What the namespace means, from `TAG_NAMESPACE_MEANINGS`. */
  meaning: string
  synonyms: ReadonlyArray<string>
  tools: ReadonlyArray<{
    key: string
    name: string
    companyName: string
    summary: string
  }>
  workflows: ReadonlyArray<{ key: string; title: string; summary: string }>
  companies: ReadonlyArray<{ key: string; name: string; summary: string }>
  updatedAt: number
}

function section(
  title: string,
  lines: ReadonlyArray<string>
): ReadonlyArray<string> {
  return lines.length === 0
    ? []
    : ['', `## ${title} (${lines.length})`, '', ...lines]
}

export function renderTagDocument(tag: TagFileInput): RenderedDocument {
  const tools = tag.tools.map(
    (tool) =>
      `- ${formatRef('tool', tool.key)} — ${tool.name} (${tool.companyName}): ${tool.summary}`
  )
  const workflows = tag.workflows.map(
    (workflow) =>
      `- ${formatRef('workflow', workflow.key)} — ${workflow.title}: ${workflow.summary}`
  )
  const companies = tag.companies.map(
    (company) =>
      `- ${formatRef('company', company.key)} — ${company.name}: ${company.summary}`
  )
  const isEmpty = tools.length + workflows.length + companies.length === 0
  const lines = [
    '---',
    `ref: ${tag.key}`,
    `label: ${yamlScalar(tag.label)}`,
    `tools: ${yamlList(tag.tools.map((tool) => formatRef('tool', tool.key)))}`,
    `workflows: ${yamlList(tag.workflows.map((workflow) => formatRef('workflow', workflow.key)))}`,
    `companies: ${yamlList(tag.companies.map((company) => formatRef('company', company.key)))}`,
    `updated: ${new Date(tag.updatedAt).toISOString().slice(0, 10)}`,
    '---',
    '',
    `# ${tag.label}`,
    '',
    tag.meaning,
    ...(tag.synonyms.length > 0
      ? ['', `Also called: ${tag.synonyms.join(', ')}.`]
      : []),
    ...(isEmpty ? ['', 'Nothing published carries this tag yet.'] : []),
    ...section('Tools', tools),
    ...section('Workflows', workflows),
    ...section('Companies', companies),
  ]
  const markdown = `${lines.join('\n')}\n`
  return { markdown, lineCount: lines.length }
}
