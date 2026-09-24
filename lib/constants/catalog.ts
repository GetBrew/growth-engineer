import type { AccessType, AgentLevel } from '@/lib/types/catalog'

/**
 * The catalog's closed sets, written once. A label or an order duplicated in
 * a component and again in the renderer drifts the moment one of them is
 * edited, which is how a page and the markdown file it shows end up
 * disagreeing about the same tool.
 */

/** The ways in, in setup order: best-supported first. */
export const ACCESS_ORDER: ReadonlyArray<AccessType> = ['mcp', 'cli', 'api']

/** The same order as a rank, for sorting. Derived, never written twice. */
export const ACCESS_RANK = Object.fromEntries(
  ACCESS_ORDER.map((type, index) => [type, index])
) as Record<AccessType, number>

export const ACCESS_LABEL: Record<AccessType, string> = {
  mcp: 'MCP',
  cli: 'CLI',
  api: 'API',
}

export const AGENT_LEVEL_LABEL: Record<AgentLevel, string> = {
  unverified: 'Unverified',
  native: 'Native',
  friendly: 'Friendly',
  possible: 'Possible',
}

/**
 * What each readiness level actually means, in one line. The label alone is a
 * word nobody can rank on sight — "possible" is not obviously below "friendly"
 * — so the page shows the rule the level was decided by.
 */
export const AGENT_LEVEL_MEANING: Record<AgentLevel, string> = {
  unverified: 'Nobody has checked how agents reach this yet',
  native: 'Official MCP or CLI, with credentials you can get yourself',
  friendly: 'Official API, with credentials you can get yourself',
  possible: 'Community access, or official access that needs approval',
}
