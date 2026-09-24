import type { AccessType, AgentLevel } from '@/lib/types/catalog'

/**
 * The two DERIVED tag namespaces. `agent:*` is a tool's readiness level and
 * `has:*` is each way in it offers; both are computed from the tool's access
 * facts at build time. They are constants, not files under tags/, so nobody
 * can propose `agent:awesome` and no contributor has to remember to tag a
 * tool with what its own access already says.
 */

export type DerivedTag = {
  namespace: 'agent' | 'has'
  slug: AgentLevel | AccessType
  label: string
  synonyms: ReadonlyArray<string>
  description: string
}

export const DERIVED_TAGS: ReadonlyArray<DerivedTag> = [
  {
    namespace: 'agent',
    slug: 'unverified',
    label: 'Agent: unverified',
    synonyms: [],
    description: 'Nobody has checked the access facts yet.',
  },
  {
    namespace: 'agent',
    slug: 'native',
    label: 'Agent: native',
    synonyms: ['agent native'],
    description: 'Official MCP or CLI with self-serve credentials.',
  },
  {
    namespace: 'agent',
    slug: 'friendly',
    label: 'Agent: friendly',
    synonyms: ['agent friendly'],
    description: 'Official API with self-serve credentials.',
  },
  {
    namespace: 'agent',
    slug: 'possible',
    label: 'Agent: possible',
    synonyms: ['agent possible'],
    description: 'Community access only, or official access behind approval.',
  },
  {
    namespace: 'has',
    slug: 'mcp',
    label: 'Has MCP',
    synonyms: ['mcp'],
    description: 'Reachable over the Model Context Protocol.',
  },
  {
    namespace: 'has',
    slug: 'cli',
    label: 'Has CLI',
    synonyms: ['cli'],
    description: 'Reachable from a command line.',
  },
  {
    namespace: 'has',
    slug: 'api',
    label: 'Has API',
    synonyms: ['api'],
    description: 'Reachable over HTTP.',
  },
]

/** The derived tag keys one tool carries: its level, then one per way in. */
export function derivedTagKeys(tool: {
  agentLevel: AgentLevel
  access: ReadonlyArray<{ type: AccessType }>
}): Array<string> {
  const types = [...new Set(tool.access.map((entry) => entry.type))]
  return [`agent:${tool.agentLevel}`, ...types.map((type) => `has:${type}`)]
}
