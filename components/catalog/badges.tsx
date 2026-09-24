import {
  ACCESS_LABEL,
  ACCESS_ORDER,
  AGENT_LEVEL_LABEL,
} from '@/lib/constants/catalog'
import type { AccessType, AgentLevel } from '@/lib/types/catalog'

type Access = { type: AccessType }

export function accessLabels(access: ReadonlyArray<Access>): Array<string> {
  return accessTypeLabels(access.map((entry) => entry.type))
}

export function accessTypeLabels(
  access: ReadonlyArray<Access['type']>
): Array<string> {
  const types = new Set(access)
  return ACCESS_ORDER.filter((type) => types.has(type)).map(
    (type) => ACCESS_LABEL[type]
  )
}

export function accessTypeLabel(type: Access['type']): string {
  return ACCESS_LABEL[type]
}

export function isAgentLevelVerified(level: AgentLevel): boolean {
  return level !== 'unverified'
}

export function agentLevelLabel(level: AgentLevel): string {
  return AGENT_LEVEL_LABEL[level]
}
