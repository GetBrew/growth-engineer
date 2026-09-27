import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { orderAccess, selectWorkflowAccess } from '@/lib/catalog/render-access'
import {
  MAX_WORKFLOW_STEPS,
  renderCompanyDocument,
  renderToolDocument,
  renderWorkflowDocument,
  TOOL_FILE_MAX_LINES,
  type ToolFileInput,
  WORKFLOW_FILE_MAX_LINES,
  type WorkflowFileInput,
} from '@/lib/catalog/render-markdown'
import type { Access } from '@/lib/types/catalog'

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
  operation: 'clay_enrich_contacts',
  auth: { method: 'oauth', selfServe: true },
}

const clayApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.clay.example/v1',
  operation: 'POST /enrich-contacts',
  docsUrl: 'https://docs.clay.example',
  auth: {
    method: 'api_key',
    envVar: 'CLAY_API_KEY',
    keyUrl: 'https://app.clay.example/settings/api',
    selfServe: true,
  },
}

// A tool is ONE function of one product — `clay/enrich-contacts`, never
// `clay/clay` — and every way in names the call that performs it.
const clay: ToolFileInput = {
  key: 'clay/enrich-contacts',
  name: 'Enrich contacts',
  companyKey: 'clay',
  workflows: [],
  summary:
    'Adds firmographic and person data to a contact or account. Clay does this.',
  // API first on purpose: the renderer must reorder to MCP-first.
  access: [clayApi, clayMcp],
  updatedAt: UPDATED_AT,
}

const apolloApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.apollo.example/v1',
  operation: 'POST /find-work-emails',
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
  operation: 'brew_send_email',
  auth: { method: 'none', selfServe: true },
}

const intentToMeeting: WorkflowFileInput = {
  key: 'intent-to-meeting',
  title: 'Turn high-intent accounts into booked meetings',
  author: 'jdoe',
  tools: [
    {
      key: 'apollo/find-work-emails',
      name: 'Find work emails',
      access: [apolloApi],
    },
    { key: 'brew/send-email', name: 'Send email', access: [brewMcp] },
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
      toolKey: 'apollo/find-work-emails',
      instruction:
        'For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.',
    },
    {
      title: 'Write emails',
      toolKey: 'brew/send-email',
      instruction:
        'Draft a short, specific email to each contact from step 1. Show the drafts to the user.',
    },
    {
      title: 'Send',
      toolKey: 'brew/send-email',
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

// One tool is not a second kind of document — it is a rendering choice about
// THESE steps: name the tool once up front instead of on every line.
const waterfall: WorkflowFileInput = {
  key: 'clay-waterfall-order',
  title: 'Find more work emails by ordering providers by hit rate',
  author: 'jdoe',
  tools: [
    {
      key: 'clay/find-work-emails',
      name: 'Find work emails',
      // The same Clay MCP server, a different tool on it.
      access: [{ ...clayMcp, operation: 'clay_find_work_emails' }],
    },
  ],
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
      toolKey: 'clay/find-work-emails',
      instruction:
        "50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate.",
    },
    {
      title: 'Reorder',
      toolKey: 'clay/find-work-emails',
      instruction:
        'the providers from highest to lowest hit rate, stopping at the first verified email.',
    },
    {
      title: 'Run',
      toolKey: 'clay/find-work-emails',
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

  test('a workflow that uses one tool names it once, not per step', () => {
    const rendered = renderWorkflowDocument(waterfall)
    expect(rendered.markdown).toBe(golden('single-tool-workflow'))
  })
})

describe('setup picks the best way in', () => {
  const communityCli: Access = {
    type: 'cli',
    official: false,
    maintainer: 'jdoe',
    installCommand: 'npm install -g clay-cli',
    binary: 'clay',
    operation: 'clay enrich-contacts',
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
    expect(selectWorkflowAccess([communityCli, clayApi, clayMcp])).toHaveLength(
      2
    )
  })

  test('two options render under sub-headings with the first-supported line', () => {
    const rendered = renderWorkflowDocument({
      ...waterfall,
      tools: [
        {
          key: 'clay/find-work-emails',
          name: 'Find work emails',
          access: [clayMcp, clayApi],
        },
      ],
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
        toolKey: 'clay/find-work-emails',
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
        },
      ],
      updatedAt: UPDATED_AT,
    })
    expect(rendered.markdown).toContain('ref: company:clay')
    expect(rendered.markdown).toContain('tools: [tool:clay/clay]')
    expect(rendered.markdown).toContain(
      '- tool:clay/clay — Clay: Enriches people and companies.'
    )
    expect(rendered.markdown).toContain('- Website: https://clay.example')
  })
})
