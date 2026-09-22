import type { Access, AgentLevel } from './types'

/**
 * Agent readiness: a LEVEL by rule, a SCORE only for sorting within a level.
 *
 * Rules are checked from the top; the first match wins.
 *
 *   unverified  nobody has checked the facts yet (the default for new listings)
 *   native      an official MCP server or CLI, and self-serve credentials
 *   friendly    an official API, and self-serve credentials
 *   possible    only community access, or official access behind approval
 *
 * A tool whose official access has failed health checks for 7 days drops one
 * level until it recovers. Every tool carries the REASON for its level; it
 * shows on the page and as `agent_note` in the file header.
 *
 * PURE MODULE: type-only imports; runs at build time and in the browser.
 */

export type AgentAssessment = {
  level: AgentLevel
  score: number
  reason: string
}

const LEVEL_LABEL: Record<AgentLevel, string> = {
  unverified: 'Unverified',
  native: 'Native',
  friendly: 'Friendly',
  possible: 'Possible',
}

/** Levels in descending capability; used to drop one step. */
const LADDER: ReadonlyArray<AgentLevel> = ['native', 'friendly', 'possible']

export const HEALTH_DEGRADE_AFTER_MS = 7 * 24 * 60 * 60 * 1000

function describeAuth(access: Access): string {
  switch (access.auth.method) {
    case 'oauth':
      return 'self-serve OAuth'
    case 'api_key':
      return access.auth.selfServe
        ? 'a self-serve API key'
        : 'an approved API key'
    case 'none':
      return 'no auth'
    default:
      return 'auth'
  }
}

function describeAccess(access: Access): string {
  switch (access.type) {
    case 'mcp':
      return `${access.transport} MCP`
    case 'cli':
      return 'CLI'
    case 'api':
      return 'API'
    default:
      return 'access'
  }
}

/**
 * Compute the level, score and reason. `checkedAt` is the last time a person
 * verified the access facts; absent means nobody has, whatever the data says.
 */
export function computeAgentLevel(input: {
  access: ReadonlyArray<Access>
  checkedAt: number | undefined
  machineReadableDocs: boolean | undefined
  now: number
}): AgentAssessment {
  if (input.checkedAt === undefined) {
    return { level: 'unverified', score: 0, reason: 'Not checked yet.' }
  }

  const official = input.access.filter((access) => access.official)
  const nativeVia = official.find(
    (access) =>
      (access.type === 'mcp' || access.type === 'cli') && access.auth.selfServe
  )
  const friendlyVia = official.find(
    (access) => access.type === 'api' && access.auth.selfServe
  )

  let level: AgentLevel
  let reason: string
  if (nativeVia) {
    level = 'native'
    reason = `official ${describeAccess(nativeVia)} with ${describeAuth(nativeVia)}.`
  } else if (friendlyVia) {
    level = 'friendly'
    reason = `official API with ${describeAuth(friendlyVia)}.`
  } else if (official.length > 0) {
    level = 'possible'
    reason = 'official access needs a sales call or approval.'
  } else if (input.access.length > 0) {
    level = 'possible'
    reason = 'community-maintained access only.'
  } else {
    level = 'possible'
    reason = 'no documented way in.'
  }

  // Broken access lowers the level: 7 days of failing official health checks
  // drop the tool one step until it recovers.
  const failingSince = official
    .map((access) => access.health?.failingSince)
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b)[0]
  if (
    failingSince !== undefined &&
    input.now - failingSince >= HEALTH_DEGRADE_AFTER_MS
  ) {
    const index = LADDER.indexOf(level)
    level = LADDER[Math.min(index + 1, LADDER.length - 1)] ?? level
    reason += ' Health checks have failed for 7 days.'
  }

  return {
    level,
    score: computeScore(input.access, input.machineReadableDocs, input.now),
    reason: `${LEVEL_LABEL[level]}: ${reason}`,
  }
}

/** 0–100, sorting within a level only. */
function computeScore(
  access: ReadonlyArray<Access>,
  machineReadableDocs: boolean | undefined,
  now: number
): number {
  let score = 0
  if (
    access.some(
      (entry) =>
        entry.type === 'mcp' && entry.official && entry.transport === 'remote'
    )
  ) {
    score += 30
  }
  if (machineReadableDocs) {
    score += 20
  }
  if (access.some((entry) => entry.auth.method === 'oauth')) {
    score += 15
  }
  if (access.length > 1) {
    score += 15
  }
  if (
    access.some(
      (entry) =>
        entry.health?.ok === true &&
        now - entry.health.checkedAt <= HEALTH_DEGRADE_AFTER_MS
    )
  ) {
    score += 20
  }
  return Math.min(score, 100)
}

/** `Native: official remote MCP …` → `official remote MCP …`, for `agent_note`. */
export function agentNote(reason: string): string {
  const separator = reason.indexOf(': ')
  const note = separator === -1 ? reason : reason.slice(separator + 2)
  return note.charAt(0).toUpperCase() + note.slice(1)
}
