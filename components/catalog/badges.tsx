import { Badge } from '@/components/ui/badge'
import type { Doc } from '@/convex/_generated/dataModel'

type AgentLevel = Doc<'tools'>['agent']['level']
type Access = Doc<'tools'>['access'][number]

const LEVEL_LABEL: Record<AgentLevel, string> = {
  unverified: 'Unverified',
  native: 'Native',
  friendly: 'Friendly',
  possible: 'Possible',
}

/** The agent-readiness level, with its reason as the title. */
export function AgentLevelBadge({
  level,
  reason,
}: {
  level: AgentLevel
  reason?: string
}) {
  return (
    <Badge title={reason} variant={level === 'unverified' ? 'outline' : 'tool'}>
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {LEVEL_LABEL[level]}
    </Badge>
  )
}

const ACCESS_LABEL: Record<Access['type'], string> = {
  mcp: 'MCP',
  cli: 'CLI',
  api: 'API',
}
const ACCESS_ORDER: Array<Access['type']> = ['mcp', 'cli', 'api']

/** The ways in, deduplicated, in setup order. */
export function AccessBadges({ access }: { access: ReadonlyArray<Access> }) {
  const types = new Set(access.map((entry) => entry.type))
  return (
    <>
      {ACCESS_ORDER.filter((type) => types.has(type)).map((type) => (
        <Badge key={type} variant="soft">
          {ACCESS_LABEL[type]}
        </Badge>
      ))}
    </>
  )
}
