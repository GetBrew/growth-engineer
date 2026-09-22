import type { Doc } from '@/convex/_generated/dataModel'

type AgentLevel = Doc<'tools'>['agent']['level']
type Access = Doc<'tools'>['access'][number]

const LEVEL_LABEL: Record<AgentLevel, string> = {
  unverified: 'Unverified',
  native: 'Native',
  friendly: 'Friendly',
  possible: 'Possible',
}

const ACCESS_LABEL: Record<Access['type'], string> = {
  mcp: 'MCP',
  cli: 'CLI',
  api: 'API',
}
const ACCESS_ORDER: Array<Access['type']> = ['mcp', 'cli', 'api']

/** The ways in as labels ("MCP", "CLI", "API"), deduplicated, in setup order. */
export function accessLabels(access: ReadonlyArray<Access>): Array<string> {
  return accessTypeLabels(access.map((entry) => entry.type))
}

/** Access-type labels when a list projection carries only the compact type. */
export function accessTypeLabels(
  access: ReadonlyArray<Access['type']>
): Array<string> {
  const types = new Set(access)
  return ACCESS_ORDER.filter((type) => types.has(type)).map(
    (type) => ACCESS_LABEL[type]
  )
}

/** The agent-readiness level as a label: "Native", "Friendly", … */
export function agentLevelLabel(level: AgentLevel): string {
  return LEVEL_LABEL[level]
}
