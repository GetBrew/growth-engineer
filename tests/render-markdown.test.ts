import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { parse } from 'yaml'
import {
  orderAccess,
  type SetupTool,
  selectWorkflowAccess,
} from '@/lib/catalog/render-access'
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
  operation: 'clay_run_routine',
  auth: { method: 'oauth' },
}

const clayApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.clay.example/v1',
  operation: 'POST /routines/{routine_id}/run',
  docsUrl: 'https://docs.clay.example',
  auth: {
    method: 'api_key',
    envVar: 'CLAY_API_KEY',
    keyUrl: 'https://app.clay.example/settings/api',
  },
}

// A tool is ONE function of one product — `clay/run-routine`, never
// `clay/clay` — and every way in names the call that performs it.
const clay: ToolFileInput = {
  key: 'clay/run-routine',
  name: 'Run a routine',
  companyKey: 'clay',
  workflows: [],
  tags: [
    'has:mcp',
    'capability:enrich-contacts',
    'has:api',
    'category:data-provider',
  ],
  summary:
    'Runs an enrichment function, such as Work Email, on up to 100 records and returns a run id.',
  notes:
    'List routines first to get the routine id, then poll the run id for results.',
  // API first on purpose: the renderer must reorder to MCP-first.
  access: [clayApi, clayMcp],
  updatedAt: UPDATED_AT,
}

const apolloApi: Access = {
  type: 'api',
  official: true,
  baseUrl: 'https://api.apollo.example/v1',
  operation: 'POST /people/bulk_match',
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
  notes: 'An admin turns on MCP access under Settings first.',
}

const apolloBulkEnrich: SetupTool = {
  key: 'apollo/bulk-enrich-people',
  name: 'Enrich up to 10 people',
  companyName: 'Apollo',
  access: [apolloApi],
  notes: 'Credits are charged per person, and only when data is found.',
}

const clayRunRoutine: SetupTool = {
  key: 'clay/run-routine',
  name: 'Run a routine',
  companyName: 'Clay',
  access: [clayMcp],
  notes:
    'List routines first to get the routine id, then poll the run id for results.',
}

const intentToMeeting: WorkflowFileInput = {
  key: 'intent-to-meeting',
  title: 'Turn high-intent accounts into booked meetings',
  summary:
    'Finds the head of sales at each target account with Apollo, drafts an email to each, and sends the approved ones with Brew.',
  author: 'jdoe',
  tools: [
    apolloBulkEnrich,
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
      toolKey: 'apollo/bulk-enrich-people',
      instruction:
        'For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.',
    },
    // No tool: the agent writes the drafts itself.
    {
      title: 'Write emails',
      instruction:
        'Draft a short, specific email to each contact from step 1. Show the drafts to the user.',
    },
    {
      title: 'Send',
      toolKey: 'brew/send-email',
      instruction:
        'After the user approves, send each one from `sender_email`.',
    },
  ],
  outcome: [
    'A contact for every account, or a note on why there is none.',
    'Each approved email sent, and a summary table of who got one.',
  ],
  updatedAt: UPDATED_AT,
}

// One tool is not a second kind of document — it is a rendering choice about
// THESE steps: name the tool once up front instead of on every line.
const workEmails: WorkflowFileInput = {
  key: 'work-emails-for-a-list',
  title: 'Find work emails for a list of contacts',
  summary:
    "Runs Clay's Work Email routine on your contacts and collects a work email for each.",
  author: 'jdoe',
  tools: [clayRunRoutine],
  tags: ['motion:outbound'],
  inputs: [
    {
      name: 'contacts',
      description: 'the people to enrich, each with a name and company domain',
    },
  ],
  steps: [
    {
      title: 'Start runs',
      toolKey: 'clay/run-routine',
      instruction:
        'Run the Work Email routine on `contacts`, up to 100 per run. Keep each run id.',
    },
    {
      title: 'Collect results',
      toolKey: 'clay/run-routine',
      instruction:
        "Read the results of every run id once it finishes. Keep each contact's work email, or a note that none was found.",
    },
  ],
  outcome: [
    'A work email for every contact, or a note on why none was found.',
    'A table of the results.',
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
    const rendered = renderWorkflowDocument(workEmails)
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
    operation: 'clay routines run',
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
      ...workEmails,
      tools: [
        {
          key: 'clay/run-routine',
          name: 'Run a routine',
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
          key: 'clay/run-routine',
          name: 'Run a routine',
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
          toolKey: 'clay/run-routine',
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
        '### Clay (tool:clay/search-people, tool:clay/run-routine)',
        '',
        // The API runs only one of the two calls, so the choice is per call.
        'For each call, use the first option your agent supports that lists it.',
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
        '- Run a routine: call the MCP tool `clay_run_routine`',
        '',
        '#### API (official)',
        '',
        '- Base URL: https://api.clay.example/v1',
        '- Run a routine: `POST /routines/{routine_id}/run`',
        '- Auth: send the header `Authorization: Bearer $CLAY_API_KEY`',
        '- Get a key: https://app.clay.example/settings/api',
        '',
        'Before step 1, confirm access with the cheapest read-only call, like a list or a search. Never send or change anything to test access.',
        '',
        '',
      ].join('\n')
    )
  })

  test('when every option runs every call, the first one supported is enough', () => {
    const search: Access = { ...clayMcp, operation: 'clay_search_people' }
    const searchApi: Access = { ...clayApi, operation: 'POST /search' }
    const setup = renderWorkflowDocument({
      ...intentToMeeting,
      tools: [
        {
          key: 'clay/run-routine',
          name: 'Run a routine',
          companyName: 'Clay',
          access: [clayApi, clayMcp],
        },
        {
          key: 'clay/search-people',
          name: 'Search people',
          companyName: 'Clay',
          access: [searchApi, search],
        },
      ],
      steps: [
        { title: 'Find', toolKey: 'clay/search-people', instruction: 'Find.' },
        {
          title: 'Enrich',
          toolKey: 'clay/run-routine',
          instruction: 'Add.',
        },
      ],
    }).markdown
    expect(setup).toContain('Use the first option your agent supports.')
    expect(setup).not.toContain('For each call')
  })

  test('a community option names its maintainer', () => {
    const rendered = renderToolDocument({ ...clay, access: [communityCli] })
    expect(rendered.markdown).toContain('### CLI (community)')
    expect(rendered.markdown).toContain('Community-maintained by jdoe.')
  })
})

describe('what to know before calling', () => {
  const auth = (
    extra: Partial<Extract<Access['auth'], { method: 'api_key' }>>
  ) =>
    renderToolDocument({
      ...clay,
      access: [
        {
          ...clayApi,
          auth: { method: 'api_key', envVar: 'CLAY_API_KEY', ...extra },
        },
      ],
    }).markdown

  test.each([
    [{}, '`Authorization: Bearer $CLAY_API_KEY`'],
    [{ scheme: 'Basic' }, '`Authorization: Basic $CLAY_API_KEY`'],
    [{ header: 'X-Api-Key' }, '`X-Api-Key: $CLAY_API_KEY`'],
    [{ header: 'Authorization' }, '`Authorization: $CLAY_API_KEY`'],
    [{ header: 'X-Key', scheme: 'Token' }, '`X-Key: Token $CLAY_API_KEY`'],
  ])('header %j sends %s', (extra, line) => {
    expect(auth(extra)).toContain(`- Auth: send the header ${line}`)
  })

  test("a way's notes follow the way, in the tool file and the workflow", () => {
    const noted: Access = {
      ...clayMcp,
      notes: 'An admin turns on MCP access first.',
    }
    const tool = renderToolDocument({ ...clay, access: [noted] }).markdown
    expect(tool).toContain(
      'Server URL: https://mcp.clay.example/mcp\n\nNote: An admin turns on MCP access first.'
    )
    const workflow = renderWorkflowDocument({
      ...workEmails,
      tools: [{ ...clayRunRoutine, access: [noted, clayApi] }],
    }).markdown
    expect(workflow).toContain(
      'Call the MCP tool `clay_run_routine`.\n\nNote: An admin turns on MCP access first.'
    )
  })

  test('with two options, the notes come before them, not inside the last', () => {
    const setup = renderWorkflowDocument({
      ...workEmails,
      tools: [{ ...clayRunRoutine, access: [clayMcp, clayApi] }],
    }).markdown
    const note = setup.indexOf('Note: List routines first')
    expect(note).toBeGreaterThan(-1)
    expect(note).toBeLessThan(setup.indexOf('#### MCP (official, remote)'))
  })

  test('a generic operation several tools share names the call it runs', () => {
    const shared: Access = {
      ...clayMcp,
      operation: 'clay_api_read',
      endpoint: 'GET /routines',
    }
    expect(
      renderToolDocument({ ...clay, access: [shared] }).markdown
    ).toContain('Call the MCP tool `clay_api_read` with `GET /routines`.')
  })

  test('several tools of one company list their notes by name', () => {
    const setup = renderWorkflowDocument({
      ...intentToMeeting,
      tools: [
        {
          ...apolloBulkEnrich,
          key: 'apollo/search-people',
          name: 'Search people',
          notes: 'Returns no emails; enrich the matches next.',
        },
        apolloBulkEnrich,
      ],
      steps: [
        {
          title: 'Find',
          toolKey: 'apollo/search-people',
          instruction: 'Find.',
        },
        {
          title: 'Enrich',
          toolKey: 'apollo/bulk-enrich-people',
          instruction: 'Enrich.',
        },
      ],
    }).markdown
    expect(setup).toContain(
      [
        'Notes:',
        '',
        '- Search people: Returns no emails; enrich the matches next.',
        '- Enrich up to 10 people: Credits are charged per person, and only when data is found.',
      ].join('\n')
    )
  })
})

describe('file limits', () => {
  test('more than ten steps is refused, not truncated', () => {
    const steps = Array.from(
      { length: MAX_WORKFLOW_STEPS + 1 },
      (_, index) => ({
        title: `Step ${index + 1}`,
        toolKey: 'clay/run-routine',
        instruction: 'do the thing.',
      })
    )
    expect(() => renderWorkflowDocument({ ...workEmails, steps })).toThrow(
      /at most 10 steps/
    )
  })

  test('a workflow states its goal first: the summary, then the outcome', () => {
    const markdown = renderWorkflowDocument(intentToMeeting).markdown
    expect(markdown).toContain(
      `# ${intentToMeeting.title}\n\n${intentToMeeting.summary}\n\n`
    )
    const headings = markdown
      .split('\n')
      .filter((line) => line.startsWith('## '))
      .map((line) => line.slice(3))
    expect(headings).toEqual(['Outcome', 'Inputs', 'Set up', 'Steps', 'Rules'])
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
          key: 'clay/run-routine',
          name: 'Run a routine',
          summary:
            'Runs an enrichment function, such as Work Email, on up to 100 records and returns a run id.',
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
      '# Run a routine\n\n> This tool is deprecated. Ask the user before using it.'
    )
    const workflow = renderWorkflowDocument({
      ...intentToMeeting,
      isDeprecated: true,
    }).markdown
    expect(header(workflow).status).toBe('deprecated')
    expect(workflow).toContain(
      `> This workflow is deprecated. Ask the user before running it.\n\n${intentToMeeting.summary}`
    )
    expect(header(renderToolDocument(clay).markdown).status).toBeUndefined()
  })
})
