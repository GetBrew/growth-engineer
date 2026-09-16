import {
  type Access,
  agentNote,
  computeAgentLevel,
  HEALTH_DEGRADE_AFTER_MS,
} from '@convex/model/agent_level'
import { describe, expect, test } from 'vitest'

/** The rules table from the design doc, one case per row, checked from the top. */

const NOW = Date.UTC(2026, 8, 16)
const CHECKED = NOW - 1000

const officialMcp: Access = {
  type: 'mcp',
  official: true,
  transport: 'remote',
  url: 'https://mcp.example/mcp',
  auth: { method: 'oauth', selfServe: true },
}
const officialApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.example/v1',
  auth: { method: 'api_key', envVar: 'X', selfServe: true },
}
const gatedApi: Access = {
  ...officialApi,
  auth: { ...officialApi.auth, selfServe: false },
}
const communityCli: Access = {
  type: 'cli',
  official: false,
  maintainer: 'jdoe',
  installCommand: 'npm i -g x',
  binary: 'x',
  auth: { method: 'none', selfServe: true },
}

const assess = (
  access: Array<Access>,
  checkedAt: number | undefined = CHECKED
) =>
  computeAgentLevel({
    access,
    checkedAt,
    machineReadableDocs: undefined,
    now: NOW,
  })

describe('agent level', () => {
  test('unverified until a person has checked, whatever the access says', () => {
    expect(
      computeAgentLevel({
        access: [officialMcp],
        checkedAt: undefined,
        machineReadableDocs: undefined,
        now: NOW,
      })
    ).toEqual({
      level: 'unverified',
      score: 0,
      reason: 'Not checked yet.',
    })
  })

  test('native: official MCP or CLI with self-serve credentials', () => {
    expect(assess([officialMcp]).level).toBe('native')
    expect(assess([officialMcp]).reason).toBe(
      'Native: official remote MCP with self-serve OAuth.'
    )
  })

  test('friendly: official API with self-serve credentials', () => {
    expect(assess([officialApi]).level).toBe('friendly')
  })

  test('possible: only community access, or official access behind approval', () => {
    expect(assess([communityCli]).level).toBe('possible')
    expect(assess([gatedApi]).level).toBe('possible')
  })

  test('the first matching rule wins', () => {
    expect(assess([gatedApi, communityCli, officialMcp]).level).toBe('native')
  })

  test('seven days of failing health drops one level', () => {
    const failing: Access = {
      ...officialMcp,
      health: {
        ok: false,
        checkedAt: NOW,
        failingSince: NOW - HEALTH_DEGRADE_AFTER_MS,
      },
    }
    const result = assess([failing])
    expect(result.level).toBe('friendly')
    expect(result.reason).toContain('Health checks have failed for 7 days.')
  })

  test('the score only orders within a level', () => {
    const one = assess([officialApi]).score
    const two = assess([officialApi, officialMcp]).score
    expect(two).toBeGreaterThan(one)
    expect(two).toBeLessThanOrEqual(100)
  })

  test('agent_note is the reason without its level prefix', () => {
    expect(
      agentNote('Native: official remote MCP with self-serve OAuth.')
    ).toBe('Official remote MCP with self-serve OAuth.')
    expect(agentNote('Not checked yet.')).toBe('Not checked yet.')
  })
})
