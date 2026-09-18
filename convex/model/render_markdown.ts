import { type AgentLevel, agentNote } from './agent_level'
import { fnv1a } from './hash'
import { formatRef } from './keys'
import {
  type Access,
  type AccessType,
  accessBody,
  accessHeading,
  orderAccess,
  selectWorkflowAccess,
  serverUrlLine,
  singleAccessSetup,
} from './render_access'

/**
 * THE render function. Every company, tool and workflow renders to one
 * markdown file from structured fields; this module is the only place that
 * knows what those files look like. Pages, the Copy button, `.md` URLs, MCP
 * `get` and `/llms.txt` all read the stored result (`documents` table).
 *
 * The contract (docs/markdown-files.md):
 *   - plain markdown with a short, flat YAML header; no agent-specific syntax
 *   - everything needed to run is inline; links only for keys and reading more
 *   - setup picks the best way in (./render_access.ts)
 *   - inputs are named in backticks, never templated
 *   - the file tells the agent to check access before running anything
 *   - Rules come last and nobody can edit them
 *   - tool files stay under ~60 lines, workflow files under ~120, ≤ 10 steps
 *
 * PURE MODULE: type-only Convex imports, deterministic for a given `now`. The
 * golden tests reproduce the design doc's example files byte for byte.
 */

export type ToolFileInput = {
  key: string
  name: string
  companyKey: string
  summary: string
  description?: string
  access: ReadonlyArray<Access>
  agent: { level: AgentLevel; reason: string }
  updatedAt: number
}

export type WorkflowFileTool = {
  key: string
  name: string
  access: ReadonlyArray<Access>
}

export type WorkflowFileStep = {
  title: string
  toolKey: string
  via?: AccessType
  instruction: string
}

export type WorkflowFileInput = {
  key: string
  version: number
  title: string
  tools: ReadonlyArray<WorkflowFileTool>
  /** Tag keys, e.g. `motion:outbound`. */
  tags: ReadonlyArray<string>
  inputs: ReadonlyArray<{ name: string; description: string; example?: string }>
  steps: ReadonlyArray<WorkflowFileStep>
  doneWhen: ReadonlyArray<string>
  notes?: string
  updatedAt: number
}

export type CompanyFileInput = {
  key: string
  name: string
  tagline?: string
  description?: string
  links: { website?: string; docs?: string }
  tools: ReadonlyArray<{
    key: string
    name: string
    summary: string
    agentLevel: AgentLevel
  }>
  updatedAt: number
}

export type RenderedDocument = {
  markdown: string
  hash: string
  lineCount: number
}

export const TOOL_FILE_MAX_LINES = 60
export const WORKFLOW_FILE_MAX_LINES = 120
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

function list(values: ReadonlyArray<string>): string {
  return `[${values.join(', ')}]`
}

function rulesSection(rules: ReadonlyArray<string>): Array<string> {
  return ['', '## Rules', '', ...rules.map((rule) => `- ${rule}`)]
}

function finish(lines: ReadonlyArray<string>): RenderedDocument {
  const markdown = `${lines.join('\n').replace(BLANK_RUNS, '\n\n').trimEnd()}\n`
  return {
    markdown,
    hash: fnv1a(markdown),
    lineCount: markdown.trimEnd().split('\n').length,
  }
}

/* ────────────────────────────────── tool ─────────────────────────────────── */

export function renderToolDocument(tool: ToolFileInput): RenderedDocument {
  const ordered = orderAccess(tool.access)
  const accessTypes = [...new Set(ordered.map((entry) => entry.type))]
  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('tool', tool.key)}`,
    `name: ${tool.name}`,
    `company: ${formatRef('company', tool.companyKey)}`,
    `access: ${list(accessTypes)}`,
    `agent: ${tool.agent.level}`,
    `agent_note: ${agentNote(tool.agent.reason)}`,
    `updated: ${isoDate(tool.updatedAt)}`,
    '---',
    '',
    `# ${tool.name}`,
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
      lines.push(...accessBody(access, tool.key, { includeDocs: true }))
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

/** One tool's setup: the step's `via` if any, else the best one or two options. */
function toolSetup(
  tool: WorkflowFileTool,
  steps: ReadonlyArray<WorkflowFileStep>
): Array<string> {
  const via = steps.find((step) => step.toolKey === tool.key && step.via)?.via
  const selected = selectWorkflowAccess(tool.access, via)
  const heading = ['', `### ${tool.name} (${formatRef('tool', tool.key)})`, '']
  if (selected.length === 0) {
    return [
      ...heading,
      'No documented way in yet. Ask the user how they reach this tool.',
    ]
  }
  const [only] = selected
  if (selected.length === 1 && only) {
    return [...heading, ...singleAccessSetup(only, tool.key)]
  }
  const options = selected.flatMap((access) => [
    '',
    `#### ${accessHeading(access)}`,
    '',
    ...accessBody(access, tool.key, { includeDocs: false }),
  ])
  return [...heading, 'Use the first option your agent supports.', ...options]
}

function setupSection(
  tools: ReadonlyArray<WorkflowFileTool>,
  steps: ReadonlyArray<WorkflowFileStep>
): Array<string> {
  return [
    '',
    '## Set up',
    ...tools.flatMap((tool) => toolSetup(tool, steps)),
    '',
    tools.length > 1
      ? 'Make one read-only call to each tool to confirm access.'
      : 'Make one read-only call to confirm access.',
  ]
}

function stepsSection(
  steps: ReadonlyArray<WorkflowFileStep>,
  toolNames: ReadonlyMap<string, string>,
  hasSoleTool: boolean
): Array<string> {
  return [
    '',
    '## Steps',
    '',
    ...steps.map((step, index) => {
      const toolName = toolNames.get(step.toolKey) ?? step.toolKey
      const lead = hasSoleTool
        ? `**${step.title}**`
        : `**${step.title}** with ${toolName}.`
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
  const toolNames = new Map(workflow.tools.map((tool) => [tool.key, tool.name]))
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

  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('workflow', workflow.key, workflow.version)}`,
    `title: ${workflow.title}`,
    `tools: ${list(usedTools.map((tool) => formatRef('tool', tool.key)))}`,
    `tags: ${list(workflow.tags)}`,
    `updated: ${isoDate(workflow.updatedAt)}`,
    '---',
    '',
    `# ${workflow.title}`,
    '',
    soleTool
      ? `Set up ${soleTool.name}, then run the steps in order for the user.`
      : 'Set up the tools below, then run the steps in order for the user.',
    ...inputsSection(workflow.inputs),
    ...setupSection(usedTools, workflow.steps),
    ...stepsSection(workflow.steps, toolNames, soleTool !== undefined),
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
  const lines: Array<string> = [
    '---',
    `ref: ${formatRef('company', company.key)}`,
    `name: ${company.name}`,
    `tools: ${list(company.tools.map((tool) => formatRef('tool', tool.key)))}`,
    `updated: ${isoDate(company.updatedAt)}`,
    '---',
    '',
    `# ${company.name}`,
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
      `- ${formatRef('tool', tool.key)} — ${tool.name}: ${tool.summary} (agent: ${tool.agentLevel})`
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
