import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { parse } from 'yaml'
import { orderAccess, selectWorkflowAccess } from '@/lib/catalog/render-access'
import { yamlScalar } from '@/lib/catalog/render-header'
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
import { renderTagDocument } from '@/lib/catalog/render-tag'
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
  auth: { method: 'oauth' },
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
  },
}

// A tool is ONE function of one product — `clay/enrich-contacts`, never
// `clay/clay` — and every way in names the call that performs it.
const clay: ToolFileInput = {
  key: 'clay/enrich-contacts',
  name: 'Enrich contacts',
  companyKey: 'clay',
  workflows: [],
  tags: [
    'has:mcp',
    'capability:enrich-contacts',
    'has:api',
    'category:data-provider',
  ],
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
  },
}

const brewMcp: Access = {
  type: 'mcp',
  official: true,
  transport: 'remote',
  url: 'https://mcp.brew.example/mcp',
  operation: 'brew_send_email',
  auth: { method: 'none' },
}

const intentToMeeting: WorkflowFileInput = {
  key: 'intent-to-meeting',
  title: 'Turn high-intent accounts into booked meetings',
  author: 'jdoe',
  tools: [
    {
      key: 'apollo/find-work-emails',
      name: 'Find work emails',
      companyName: 'Apollo',
      access: [apolloApi],
    },
    {
      key: 'brew/send-email',
      name: 'Send email',
      companyName: 'Brew',
      access: [brewMcp],
    },
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
      companyName: 'Clay',
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
    auth: { method: 'api_key', envVar: 'CLAY_API_KEY' },
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
          companyName: 'Clay',
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

  test("a company's ways are set up once, naming every call on them", () => {
    const search: Access = { ...clayMcp, operation: 'clay_search_people' }
    const rendered = renderWorkflowDocument({
      ...intentToMeeting,
      tools: [
        {
          key: 'clay/enrich-contacts',
          name: 'Enrich contacts',
          companyName: 'Clay',
          access: [clayApi, clayMcp],
        },
        {
          key: 'clay/search-people',
          name: 'Search people',
          companyName: 'Clay',
          // No API: its call shows under the MCP server only.
          access: [search],
        },
      ],
      steps: [
        { title: 'Find', toolKey: 'clay/search-people', instruction: 'Find.' },
        {
          title: 'Enrich',
          toolKey: 'clay/enrich-contacts',
          instruction: 'Add.',
        },
        { title: 'Again', toolKey: 'clay/search-people', instruction: 'More.' },
      ],
    }).markdown
    const setup = rendered.slice(
      rendered.indexOf('## Set up'),
      rendered.indexOf('## Steps')
    )
    expect(setup).toBe(
      [
        '## Set up',
        '',
        '### Clay (tool:clay/search-people, tool:clay/enrich-contacts)',
        '',
        'Use the first option your agent supports.',
        '',
        '#### MCP (official, remote)',
        '',
        "Add this server to your agent's MCP settings, then sign in when asked.",
        '',
        '```json',
        '{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }',
        '```',
        '',
        '- Search people: call the MCP tool `clay_search_people`',
        '- Enrich contacts: call the MCP tool `clay_enrich_contacts`',
        '',
        '#### API (official)',
        '',
        '- Base URL: https://api.clay.example/v1',
        '- Enrich contacts: `POST /enrich-contacts`',
        '- Auth: send the header `Authorization: Bearer $CLAY_API_KEY`',
        '- Get a key: https://app.clay.example/settings/api',
        '',
        'Make one read-only call to each tool to confirm access.',
        '',
        '',
      ].join('\n')
    )
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
      tags: ['category:data-provider'],
      tagline: 'Enrich accounts before you send.',
      links: { website: 'https://clay.example' },
      tools: [
        {
          key: 'clay/enrich-contacts',
          name: 'Enrich contacts',
          summary: 'Adds firmographic and person data to a contact or account.',
        },
      ],
      updatedAt: UPDATED_AT,
    })
    expect(rendered.markdown).toBe(golden('company'))
  })
})

describe('tag file', () => {
  test('lists every member, one line each, under its kind', () => {
    const rendered = renderTagDocument({
      key: 'capability:enrich-contacts',
      label: 'Enrich contacts',
      meaning: 'What a tool does: every vendor’s version of the same job.',
      synonyms: ['enrichment', 'contact data'],
      tools: [
        {
          key: 'apollo/enrich-person',
          name: 'Enrich a person',
          companyName: 'Apollo',
          summary: "Returns one person's title, employer and work email.",
        },
        {
          key: 'clay/run-routine',
          name: 'Run a routine',
          companyName: 'Clay',
          summary: 'Runs an enrichment function on up to 100 records.',
        },
      ],
      workflows: [
        {
          key: 'champion-job-change-loop',
          title: 'Reconnect when a product champion changes jobs',
          summary: 'Track past champions and reopen the relationship.',
        },
      ],
      companies: [
        { key: 'apollo', name: 'Apollo', summary: 'B2B data and outreach.' },
      ],
      updatedAt: UPDATED_AT,
    })
    expect(rendered.markdown).toBe(golden('tag'))
  })

  test('a tag nothing carries says so', () => {
    const rendered = renderTagDocument({
      key: 'channel:ads',
      label: 'Ads',
      meaning: 'Where a workflow reaches people.',
      synonyms: [],
      tools: [],
      workflows: [],
      companies: [],
      updatedAt: UPDATED_AT,
    }).markdown
    expect(rendered).toContain('Nothing published carries this tag yet.')
    expect(rendered).not.toContain('## ')
  })
})

describe('the header an agent parses', () => {
  const header = (markdown: string) =>
    parse(/^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? '', {
      schema: 'core',
    }) as Record<string, unknown>

  test.each([
    'Churn rescue: save accounts before renewal',
    'Win back #1 accounts',
    "Don't lose them",
    '[Draft] outbound',
    '"Quoted" title',
    '- a list?',
    '*starred*',
    'ends with a colon:',
    ' padded ',
    'true',
    '1234',
    '0x1F',
    'Line one\nstatus: published',
  ])('%j parses back to exactly itself', (value) => {
    expect(parse(`title: ${yamlScalar(value)}`, { schema: 'core' })).toEqual({
      title: value,
    })
  })

  test('a hostile title and login cannot add a header field', () => {
    const rendered = renderWorkflowDocument({
      ...intentToMeeting,
      title: 'Rescue: accounts\n---\nstatus: evil',
      author: 'true',
    })
    const fields = header(rendered.markdown)
    expect(fields.title).toBe('Rescue: accounts\n---\nstatus: evil')
    expect(fields.author).toBe('true')
    expect(fields.status).toBeUndefined()
  })

  test('a deprecated file says so in its header and under its title', () => {
    const tool = renderToolDocument({ ...clay, isDeprecated: true }).markdown
    expect(header(tool).status).toBe('deprecated')
    expect(tool).toContain(
      '# Enrich contacts\n\n> This tool is deprecated. Ask the user before using it.'
    )
    const workflow = renderWorkflowDocument({
      ...intentToMeeting,
      isDeprecated: true,
    }).markdown
    expect(header(workflow).status).toBe('deprecated')
    expect(workflow).toContain(
      '> This workflow is deprecated. Ask the user before running it.'
    )
    expect(header(renderToolDocument(clay).markdown).status).toBeUndefined()
  })
})
