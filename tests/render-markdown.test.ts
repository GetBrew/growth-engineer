import fs from 'node:fs'
import path from 'node:path'
import {
  type Access,
  orderAccess,
  selectWorkflowAccess,
} from '@convex/model/render_access'
import {
  MAX_WORKFLOW_STEPS,
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
  TOOL_FILE_MAX_LINES,
  type ToolFileInput,
  WORKFLOW_FILE_MAX_LINES,
  type WorkflowFileInput,
} from '@convex/model/render_markdown'
import { describe, expect, test } from 'vitest'

/**
 * The renderer IS the product. These goldens are the design doc's three
 * example files, reproduced byte for byte from structured input, so the file
 * format cannot drift by accident — change the format, change the fixture,
 * in the same commit.
 */

const UPDATED_AT = Date.UTC(2026, 8, 16)

function golden(name: string): string {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures/markdown', `${name}.md`),
    'utf8'
  )
}

const clayMcp: Access = {
  type: 'mcp',
  official: true,
  transport: 'remote',
  url: 'https://mcp.clay.example/mcp',
  auth: { method: 'oauth', selfServe: true },
}

const clayApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.clay.example/v1',
  docsUrl: 'https://docs.clay.example',
  auth: {
    method: 'api_key',
    envVar: 'CLAY_API_KEY',
    keyUrl: 'https://app.clay.example/settings/api',
    selfServe: true,
  },
}

const clay: ToolFileInput = {
  key: 'clay/clay',
  name: 'Clay',
  companyKey: 'clay',
  summary:
    'Enriches people and companies with data from many providers and builds lead lists from the results.',
  // Community first on purpose: the renderer must reorder to official-first.
  access: [clayApi, clayMcp],
  agent: {
    level: 'native',
    reason: 'Native: official remote MCP with self-serve OAuth.',
  },
  capabilities: [
    { slug: 'enrich-contacts', label: 'Enrich contacts' },
    { slug: 'find-work-emails', label: 'Find work emails' },
    { slug: 'build-audience', label: 'Build audiences' },
  ],
  updatedAt: UPDATED_AT,
}

const apolloApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.apollo.example/v1',
  auth: {
    method: 'api_key',
    envVar: 'APOLLO_API_KEY',
    header: 'X-Api-Key',
    keyUrl: 'https://app.apollo.example/settings/api',
    selfServe: true,
  },
}

const brewMcp: Access = {
  type: 'mcp',
  official: true,
  transport: 'remote',
  url: 'https://mcp.brew.example/mcp',
  auth: { method: 'none', selfServe: true },
}

const intentToMeeting: WorkflowFileInput = {
  key: 'brew/intent-to-meeting',
  version: 3,
  title: 'Turn high-intent accounts into booked meetings',
  format: 'workflow',
  tools: [
    { key: 'apollo/apollo', name: 'Apollo', access: [apolloApi] },
    { key: 'brew/brew', name: 'Brew', access: [brewMcp] },
  ],
  tags: ['motion:outbound', 'channel:email'],
  inputs: [
    {
      name: 'target_accounts',
      description: 'company domains to target',
      example: 'acme.example, globex.example',
    },
    { name: 'sender_email', description: 'the address emails are sent from' },
  ],
  steps: [
    {
      title: 'Find contacts',
      toolKey: 'apollo/apollo',
      instruction:
        'For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.',
    },
    {
      title: 'Write emails',
      toolKey: 'brew/brew',
      instruction:
        'Draft a short, specific email to each contact from step 1. Show the drafts to the user.',
    },
    {
      title: 'Send',
      toolKey: 'brew/brew',
      instruction:
        'After the user approves, send each email from `sender_email`.',
    },
  ],
  doneWhen: [
    'Every account has a contact, or a note explaining why not.',
    'Approved emails are sent, and the user has a summary table.',
  ],
  updatedAt: UPDATED_AT,
}

const waterfall: WorkflowFileInput = {
  key: 'jdoe/clay-waterfall-order',
  version: 1,
  title: 'Find more work emails by ordering providers by hit rate',
  format: 'hack',
  tools: [{ key: 'clay/clay', name: 'Clay', access: [clayMcp] }],
  tags: ['capability:find-work-emails'],
  inputs: [
    {
      name: 'contacts_table',
      description: 'the Clay table with name and company domain columns',
    },
  ],
  steps: [
    {
      title: 'Sample',
      toolKey: 'clay/clay',
      instruction:
        "50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate.",
    },
    {
      title: 'Reorder',
      toolKey: 'clay/clay',
      instruction:
        'the providers from highest to lowest hit rate, stopping at the first verified email.',
    },
    {
      title: 'Run',
      toolKey: 'clay/clay',
      instruction:
        'the reordered sequence on the full table, after the user confirms.',
    },
  ],
  doneWhen: [
    'The table has a verified email column.',
    'The user has the hit rate for each provider.',
  ],
  updatedAt: UPDATED_AT,
}

describe('markdown files — goldens from the design doc', () => {
  test('a tool file', () => {
    const rendered = renderToolDocument(clay)
    expect(rendered.markdown).toBe(golden('tool'))
    expect(rendered.lineCount).toBeLessThanOrEqual(TOOL_FILE_MAX_LINES)
  })

  test('a workflow file', () => {
    const rendered = renderWorkflowDocument(intentToMeeting)
    expect(rendered.markdown).toBe(golden('workflow'))
    expect(rendered.lineCount).toBeLessThanOrEqual(WORKFLOW_FILE_MAX_LINES)
  })

  test('a growth hack is the same format with one tool', () => {
    const rendered = renderWorkflowDocument(waterfall)
    expect(rendered.markdown).toBe(golden('hack'))
  })

  test('the hash changes when the file changes, and only then', () => {
    const a = renderToolDocument(clay)
    const b = renderToolDocument(clay)
    const c = renderToolDocument({ ...clay, summary: 'Something else.' })
    expect(a.hash).toBe(b.hash)
    expect(a.hash).not.toBe(c.hash)
  })
})

describe('setup picks the best way in', () => {
  const communityCli: Access = {
    type: 'cli',
    official: false,
    maintainer: 'jdoe',
    installCommand: 'npm install -g clay-cli',
    binary: 'clay',
    auth: { method: 'api_key', envVar: 'CLAY_API_KEY', selfServe: true },
  }

  test('official first, then community; MCP, CLI, API within each', () => {
    expect(
      orderAccess([communityCli, clayApi, clayMcp]).map(
        (a) => `${a.official}:${a.type}`
      )
    ).toEqual(['true:mcp', 'true:api', 'false:cli'])
  })

  test('a workflow shows at most two options per tool', () => {
    expect(
      selectWorkflowAccess([communityCli, clayApi, clayMcp], undefined)
    ).toHaveLength(2)
  })

  test("a step's `via` picks that one option", () => {
    expect(selectWorkflowAccess([clayMcp, clayApi], 'api')).toEqual([clayApi])
  })

  test('two options render under sub-headings with the first-supported line', () => {
    const rendered = renderWorkflowDocument({
      ...waterfall,
      tools: [{ key: 'clay/clay', name: 'Clay', access: [clayMcp, clayApi] }],
    })
    expect(rendered.markdown).toContain(
      'Use the first option your agent supports.'
    )
    expect(rendered.markdown).toContain('#### MCP (official, remote)')
    expect(rendered.markdown).toContain('#### API (official)')
    // Workflow files never carry the Docs line — links are for keys only.
    expect(rendered.markdown).not.toContain('- Docs:')
  })

  test('a community option names its maintainer', () => {
    const rendered = renderToolDocument({ ...clay, access: [communityCli] })
    expect(rendered.markdown).toContain('### CLI (community)')
    expect(rendered.markdown).toContain('Community-maintained by jdoe.')
  })
})

describe('file limits', () => {
  test('more than ten steps is refused, not truncated', () => {
    const steps = Array.from(
      { length: MAX_WORKFLOW_STEPS + 1 },
      (_, index) => ({
        title: `Step ${index + 1}`,
        toolKey: 'clay/clay',
        instruction: 'do the thing.',
      })
    )
    expect(() => renderWorkflowDocument({ ...waterfall, steps })).toThrow(
      /at most 10 steps/
    )
  })

  test('rules are always the last section', () => {
    for (const markdown of [
      renderToolDocument(clay).markdown,
      renderWorkflowDocument(intentToMeeting).markdown,
    ]) {
      const sections = markdown.split('\n## ').slice(1)
      expect(sections.at(-1)?.startsWith('Rules')).toBe(true)
    }
  })
})

describe('company file', () => {
  test('is a short index of the company’s tools', () => {
    const rendered = renderCompanyDocument({
      key: 'clay',
      name: 'Clay',
      tagline: 'Enrich accounts before you send.',
      links: { website: 'https://clay.example' },
      tools: [
        {
          key: 'clay/clay',
          name: 'Clay',
          summary: 'Enriches people and companies.',
          agentLevel: 'native',
        },
      ],
      updatedAt: UPDATED_AT,
    })
    expect(rendered.markdown).toContain('ref: company:clay')
    expect(rendered.markdown).toContain('tools: [tool:clay/clay]')
    expect(rendered.markdown).toContain(
      '- tool:clay/clay — Clay: Enriches people and companies. (agent: native)'
    )
    expect(rendered.markdown).toContain('- Website: https://clay.example')
  })
})
