import type { Access } from '@/lib/types/catalog'
import { formatRef } from './keys'
import {
  accessBody,
  accessHeading,
  orderAccess,
  type SetupTool,
  serverUrlLine,
  workflowSetup,
} from './render-access'
import { yamlList, yamlScalar } from './render-header'

/**
 * THE render function. Every company, tool and workflow renders to one
 * markdown file from structured fields; this module is the only place that
 * knows what those files look like. Pages, the Copy button, `.md` URLs, MCP
 * `get` and `/llms.txt` all read the stored result (`catalog.documents`).
 *
 * The contract (docs/markdown-files.md):
 *   - plain markdown with a short, flat YAML header; no agent-specific syntax
 *   - everything needed to run is inline; links only for keys and reading more
 *   - setup picks the best way in (./render-access.ts)
 *   - inputs are named in backticks, never templated
 *   - the file tells the agent to check access before running anything
 *   - Rules come last and nobody can edit them
 *   - a deprecated file says so, in its header and under its title
 *   - tool files stay under ~80 lines, workflow files under ~150, ≤ 10 steps
 *
 * PURE MODULE: type-only imports, deterministic for a given `now`. The
 * golden tests reproduce the design doc's example files byte for byte.
 */

export type ToolFileInput = {
  key: string
  name: string
  companyKey: string
  /** Keys of the workflows whose steps use this tool — the file links back. */
  workflows: ReadonlyArray<string>
  /** Computed tag keys: capability, category, ways in. */
  tags: ReadonlyArray<string>
  summary: string
  description?: string
  /** The page that documents the call. */
  docs?: string
  access: ReadonlyArray<Access>
  isDeprecated?: boolean
  updatedAt: number
}

type WorkflowFileTool = SetupTool

type WorkflowFileStep = {
  title: string
  toolKey: string
  instruction: string
}

export type WorkflowFileInput = {
  key: string
  title: string
  /** The GitHub login of whoever wrote it. */
  author: string
  tools: ReadonlyArray<WorkflowFileTool>
  /** Tag keys, e.g. `motion:outbound`. */
  tags: ReadonlyArray<string>
  inputs: ReadonlyArray<{ name: string; description: string; example?: string }>
  steps: ReadonlyArray<WorkflowFileStep>
  doneWhen: ReadonlyArray<string>
  notes?: string
  isDeprecated?: boolean
  updatedAt: number
}

export type CompanyFileInput = {
  key: string
  name: string
  /** Computed tag keys: category, and its tools' capabilities and ways in. */
  tags: ReadonlyArray<string>
  tagline?: string
  description?: string
  links: { website?: string; docs?: string }
  tools: ReadonlyArray<{
    key: string
    name: string
    summary: string
  }>
  isDeprecated?: boolean
  updatedAt: number
}

export type RenderedDocument = {
  markdown: string
  lineCount: number
}

export const TOOL_FILE_MAX_LINES = 80
export const WORKFLOW_FILE_MAX_LINES = 150
export const MAX_WORKFLOW_STEPS = 10

/** Immutable. Always the last section; nobody can edit these lines. */
const TOOL_RULES = [
  'Ask the user before anything that sends messages, costs money, or changes data.',
  'Never print API keys.',
]
const WORKFLOW_RULES = ['Only use the tools listed above.', ...TOOL_RULES]

const BLANK_RUNS = /\n{3,}/g

function isoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

/** The header line and the warning under the title a deprecated file carries. */
function deprecation(
  isDeprecated: boolean | undefined,
  warning: string
): { header: Array<string>; notice: Array<string> } {
  return isDeprecated
    ? { header: ['status: deprecated'], notice: ['', `> ${warning}`] }
    : { header: [], notice: [] }
}

function rulesSection(rules: ReadonlyArray<string>): Array<string> {
  return ['', '## Rules', '', ...rules.map((rule) => `- ${rule}`)]
}

function finish(lines: ReadonlyArray<string>): RenderedDocument {
  const markdown = `${lines.join('\n').replace(BLANK_RUNS, '\n\n').trimEnd()}\n`
  return {
    markdown,
    lineCount: markdown.trimEnd().split('\n').length,
  }
}

/* ────────────────────────────────── tool ─────────────────────────────────── */

export function renderToolDocument(tool: ToolFileInput): RenderedDocument {
  const ordered = orderAccess(tool.access)
  const accessTypes = [...new Set(ordered.map((entry) => entry.type))]
  const deprecated = deprecation(
    tool.isDeprecated,
    'This tool is deprecated. Ask the user before using it.'
  )
  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('tool', tool.key)}`,
    `name: ${yamlScalar(tool.name)}`,
    `company: ${formatRef('company', tool.companyKey)}`,
    `workflows: ${yamlList(tool.workflows.map((key) => formatRef('workflow', key)))}`,
    `access: ${yamlList(accessTypes)}`,
    `tags: ${yamlList([...tool.tags].sort())}`,
    ...(tool.docs ? [`docs: ${yamlScalar(tool.docs)}`] : []),
    ...deprecated.header,
    `updated: ${isoDate(tool.updatedAt)}`,
    '---',
    '',
    `# ${tool.name}`,
    ...deprecated.notice,
    '',
    tool.summary,
  ]
  if (tool.description) {
    lines.push('', tool.description)
  }

  if (ordered.length > 0) {
    lines.push('', '## Set up', '', 'Use the first option your agent supports.')
    for (const access of ordered) {
      lines.push('', `### ${accessHeading(access)}`, '')
      lines.push(
        ...accessBody([{ access }], tool.companyKey, {
          includeDocs: true,
        })
      )
      const serverUrl = serverUrlLine(access)
      if (serverUrl) {
        lines.push('', serverUrl)
      }
    }
    lines.push(
      '',
      'Before doing anything else, make one read-only call to confirm access.'
    )
  }

  lines.push(...rulesSection(TOOL_RULES))
  return finish(lines)
}

/* ──────────────────────────────── workflow ───────────────────────────────── */

function inputsSection(inputs: WorkflowFileInput['inputs']): Array<string> {
  if (inputs.length === 0) {
    return []
  }
  const intro =
    inputs.length === 1
      ? 'Ask the user for this before you start.'
      : 'Ask the user for these before you start.'
  return [
    '',
    '## Inputs',
    '',
    intro,
    '',
    ...inputs.map((input) => {
      const example = input.example ? `, e.g. ${input.example}` : ''
      return `- \`${input.name}\`: ${input.description}${example}`
    }),
  ]
}

/** "Find work emails (Apollo)": a tool as a step names it. */
function toolLabel(tool: WorkflowFileTool): string {
  return `${tool.name} (${tool.companyName})`
}

function stepsSection(
  steps: ReadonlyArray<WorkflowFileStep>,
  tools: ReadonlyMap<string, WorkflowFileTool>,
  hasSoleTool: boolean
): Array<string> {
  return [
    '',
    '## Steps',
    '',
    ...steps.map((step, index) => {
      const tool = tools.get(step.toolKey)
      const label = tool ? toolLabel(tool) : step.toolKey
      const lead = hasSoleTool
        ? `**${step.title}**`
        : `**${step.title}** with ${label}.`
      return `${index + 1}. ${lead} ${step.instruction}`
    }),
  ]
}

export function renderWorkflowDocument(
  workflow: WorkflowFileInput
): RenderedDocument {
  if (workflow.steps.length > MAX_WORKFLOW_STEPS) {
    throw new Error(
      `A workflow file has at most ${MAX_WORKFLOW_STEPS} steps; ${workflow.key} has ${workflow.steps.length}.`
    )
  }
  const toolsByKey = new Map(workflow.tools.map((tool) => [tool.key, tool]))
  // Tools in first-use order across the steps — the header and setup follow it.
  const usedTools = [
    ...new Set(workflow.steps.map((step) => step.toolKey)),
  ].flatMap((key) => {
    const tool = toolsByKey.get(key)
    return tool ? [tool] : []
  })
  // A workflow that happens to use one tool reads better naming it once up
  // front than repeating it on every step. That is a rendering choice about
  // THESE steps, not a second kind of document.
  const soleTool = usedTools.length === 1 ? usedTools[0] : undefined
  const deprecated = deprecation(
    workflow.isDeprecated,
    'This workflow is deprecated. Ask the user before running it.'
  )

  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('workflow', workflow.key)}`,
    `title: ${yamlScalar(workflow.title)}`,
    `author: ${yamlScalar(workflow.author)}`,
    `tools: ${yamlList(usedTools.map((tool) => formatRef('tool', tool.key)))}`,
    `tags: ${yamlList(workflow.tags)}`,
    ...deprecated.header,
    `updated: ${isoDate(workflow.updatedAt)}`,
    '---',
    '',
    `# ${workflow.title}`,
    ...deprecated.notice,
    '',
    soleTool
      ? `Set up ${toolLabel(soleTool)}, then run the steps in order for the user.`
      : 'Set up the tools below, then run the steps in order for the user.',
    ...inputsSection(workflow.inputs),
    ...workflowSetup(usedTools),
    ...stepsSection(workflow.steps, toolsByKey, soleTool !== undefined),
  ]

  if (workflow.doneWhen.length > 0) {
    lines.push(
      '',
      '## Done when',
      '',
      ...workflow.doneWhen.map((check) => `- ${check}`)
    )
  }
  if (workflow.notes) {
    lines.push('', '## Notes', '', workflow.notes.trim())
  }
  lines.push(...rulesSection(WORKFLOW_RULES))
  return finish(lines)
}

/* ──────────────────────────────── company ────────────────────────────────── */

export function renderCompanyDocument(
  company: CompanyFileInput
): RenderedDocument {
  const deprecated = deprecation(
    company.isDeprecated,
    'This company is deprecated.'
  )
  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('company', company.key)}`,
    `name: ${yamlScalar(company.name)}`,
    `tools: ${yamlList(company.tools.map((tool) => formatRef('tool', tool.key)))}`,
    `tags: ${yamlList([...company.tags].sort())}`,
    ...deprecated.header,
    `updated: ${isoDate(company.updatedAt)}`,
    '---',
    '',
    `# ${company.name}`,
    ...deprecated.notice,
  ]
  if (company.tagline) {
    lines.push('', company.tagline)
  }
  if (company.description) {
    lines.push('', company.description)
  }
  lines.push('', '## Tools', '')
  if (company.tools.length === 0) {
    lines.push('No published tools yet.')
  }
  for (const tool of company.tools) {
    lines.push(
      `- ${formatRef('tool', tool.key)} — ${tool.name}: ${tool.summary}`
    )
  }
  const links = [
    company.links.website ? `- Website: ${company.links.website}` : null,
    company.links.docs ? `- Docs: ${company.links.docs}` : null,
  ].filter((line): line is string => line !== null)
  if (links.length > 0) {
    lines.push('', '## Links', '', ...links)
  }
  return finish(lines)
}
