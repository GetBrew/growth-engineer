import { afterEach, describe, expect, test, vi } from 'vitest'
import { getCatalog } from '@/lib/catalog/catalog'
import { relationsOf } from '@/lib/catalog/relations'
import { buildCatalog, type Catalog } from '@/lib/content/build-catalog'
import type { ContentFile } from '@/lib/content/read-tree'
import { FEEDBACK_URL } from '@/lib/mcp/feedback-tool'
import { handleMessage } from '@/lib/mcp/server'

/**
 * What the MCP tools answer, called the way a client calls them — through
 * `handleMessage` — against the real catalog (natural-language queries, every
 * filter, every kind of ref) and against a small fixture catalog for what the
 * real tree doesn't hold yet: a renamed key, a deprecated workflow, a draft.
 * `submit_feedback` posts to a stubbed `fetch`, so nothing leaves the process.
 */

const ORIGIN = 'https://example.test'

type Result = {
  content: Array<{ type: string; text: string }>
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

async function call(
  catalog: Catalog,
  name: string,
  args: unknown,
  agentClient?: string
): Promise<Result> {
  const response = await handleMessage(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    },
    { catalog, origin: ORIGIN, agentClient }
  )
  if (!(response && 'result' in response)) {
    throw new Error(`no result: ${JSON.stringify(response)}`)
  }
  return response.result as Result
}

/** `get` for each ref at once, paired with the ref that was asked for. */
async function getEach(
  catalog: Catalog,
  refs: Array<string>
): Promise<Array<[string, Result]>> {
  const results = await Promise.all(
    refs.map((ref) => call(catalog, 'get', { ref }))
  )
  return results.map((result, index) => [refs[index] ?? '', result])
}

type Row = { ref: string; type: string; tags: Array<string>; author?: string }

function rows(result: Result): Array<Row> {
  return (result.structuredContent?.results ?? []) as Array<Row>
}

describe('search, on the real catalog', () => {
  const catalog = getCatalog()

  test('reads a sentence the way an agent writes it', async () => {
    const outbound = await call(catalog, 'search', {
      query: 'outbound workflow',
    })
    expect(outbound.isError).toBeFalsy()
    expect(outbound.structuredContent?.isPartial).toBe(false)
    const found = rows(outbound)
    expect(found.length).toBeGreaterThan(0)
    // "workflow" picked the type; "outbound" found the motion.
    expect(found.every((row) => row.type === 'workflow')).toBe(true)
    expect(found.map((row) => row.ref)).toContain(
      'workflow:funding-signal-outbound'
    )

    const enriching = rows(
      await call(catalog, 'search', { query: 'enriching contacts' })
    )
    expect(enriching[0]?.tags).toContain('capability:enrich-contacts')

    const tools = rows(
      await call(catalog, 'search', {
        query: 'the best tools for sending email',
      })
    )
    expect(tools.length).toBeGreaterThan(0)
    expect(tools.every((row) => row.type === 'tool')).toBe(true)
  })

  test('falls back to the closest matches instead of nothing', async () => {
    const result = await call(catalog, 'search', {
      query: 'enrich contacts zzzunmatchable',
    })
    expect(result.structuredContent?.isPartial).toBe(true)
    expect(rows(result).length).toBeGreaterThan(0)
  })

  test('browses with no words, featured workflows first', async () => {
    const result = await call(catalog, 'search', {})
    expect(rows(result)[0]?.ref).toBe(
      `workflow:${catalog.order.workflowsFeatured[0]}`
    )
    expect(result.structuredContent?.total).toBe(
      catalog.order.workflowsFeatured.length +
        catalog.order.toolsNew.length +
        catalog.order.companies.length
    )
  })

  test('filters: tags, company, uses and author', async () => {
    const mcpWorkflows = rows(
      await call(catalog, 'search', { tags: ['has:mcp'], type: 'workflow' })
    )
    expect(mcpWorkflows.every((row) => row.tags.includes('has:mcp'))).toBe(true)

    // Two tags in one namespace: either; across namespaces: both.
    const either = rows(
      await call(catalog, 'search', {
        tags: ['channel:email', 'channel:chat'],
        limit: 50,
      })
    )
    expect(
      either.every(
        (row) =>
          row.tags.includes('channel:email') ||
          row.tags.includes('channel:chat')
      )
    ).toBe(true)

    const [company] = catalog.order.companies
    const byCompany = rows(
      await call(catalog, 'search', { company: company ?? '', limit: 50 })
    )
    const links = relationsOf(catalog, `company:${company}`)
    expect(byCompany.map((row) => row.ref).sort()).toEqual(
      [
        `company:${company}`,
        ...links.tools.map((key) => `tool:${key}`),
        ...links.workflows.map((key) => `workflow:${key}`),
      ].sort()
    )

    const [workflow] = catalog.workflows.values()
    const [toolKey] = workflow?.toolKeys ?? []
    const users = rows(
      await call(catalog, 'search', { uses: `tool:${toolKey}`, limit: 50 })
    )
    expect(users.map((row) => row.ref)).toEqual(
      relationsOf(catalog, `tool:${toolKey}`).workflows.map(
        (key) => `workflow:${key}`
      )
    )

    const author = workflow?.author ?? ''
    const byAuthor = rows(
      await call(catalog, 'search', { author: author.toUpperCase(), limit: 50 })
    )
    expect(byAuthor.every((row) => row.author === author)).toBe(true)
    expect(byAuthor.length).toBeGreaterThan(0)
  })

  test('limit caps the rows; total says how many matched', async () => {
    const result = await call(catalog, 'search', { limit: 1 })
    expect(rows(result)).toHaveLength(1)
    expect(Number(result.structuredContent?.total)).toBeGreaterThan(1)
  })

  test.each([
    [{ nope: true }, /Invalid arguments/],
    [{ limit: 51 }, /Invalid arguments: limit/],
    [{ type: 'person' }, /Invalid arguments: type/],
    [{ tags: ['capability:nope'] }, /Invalid arguments: tags/],
    [{ company: 'clya' }, /No company "clya"\. Did you mean clay\?/],
    [{ type: 'tool', author: 'x' }, /No workflows by "x"|find workflows/],
  ])('%j is an error the agent can fix', async (args, message) => {
    const result = await call(catalog, 'search', args)
    expect(result.isError).toBe(true)
    expect(result.content[0]?.text).toMatch(message)
  })
})

describe('get, on the real catalog', () => {
  const catalog = getCatalog()

  test('each kind returns its file and its links as refs', async () => {
    const results = await getEach(catalog, [
      `company:${catalog.order.companies[0]}`,
      `tool:${catalog.order.toolsNew[0]}`,
      `workflow:${catalog.order.workflowsFeatured[0]}`,
    ])
    for (const [ref, result] of results) {
      expect(result.isError, ref).toBeFalsy()
      expect(result.content[0]?.text).toBe(catalog.documents.get(ref)?.markdown)
      const links = relationsOf(catalog, ref)
      expect(result.structuredContent?.ref).toBe(ref)
      expect(result.structuredContent?.tools).toEqual(
        links.tools.map((key) => `tool:${key}`)
      )
      expect(result.structuredContent?.workflows).toEqual(
        links.workflows.map((key) => `workflow:${key}`)
      )
    }
  })

  test('a tag returns everything carrying it', async () => {
    const result = await call(catalog, 'get', {
      ref: 'capability:enrich-contacts',
    })
    expect(result.isError).toBeFalsy()
    expect(result.structuredContent?.type).toBe('tag')
    const tools = result.structuredContent?.tools as Array<string>
    expect(tools).toEqual(
      relationsOf(catalog, 'capability:enrich-contacts').tools.map(
        (key) => `tool:${key}`
      )
    )
    const searched = rows(
      await call(catalog, 'search', {
        tags: ['capability:enrich-contacts'],
        type: 'tool',
        limit: 50,
      })
    ).map((row) => row.ref)
    expect([...tools].sort()).toEqual([...searched].sort())
    // The answer is the tag's file, byte for byte what its URL serves.
    expect(result.content[0]?.text).toBe(
      catalog.tagDocuments.get('capability:enrich-contacts')?.markdown
    )
    expect(result.structuredContent?.url).toBe(
      `${ORIGIN}/tags/capability/enrich-contacts.md`
    )
    const byUrl = await call(catalog, 'get', {
      ref: `${ORIGIN}/tags/capability/enrich-contacts.md`,
    })
    expect(byUrl.structuredContent?.ref).toBe('capability:enrich-contacts')
  })

  test('every ref the tool descriptions give as an example is real', async () => {
    const response = await handleMessage(
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      { catalog, origin: ORIGIN }
    )
    const text = JSON.stringify(response)
    const refs = [
      ...text.matchAll(
        /`((?:tool|workflow|company|capability|category|channel|motion|has):[a-z0-9/-]+)`/g
      ),
    ].map((match) => match[1] ?? '')
    expect(refs.length).toBeGreaterThan(2)
    for (const [ref, result] of await getEach(catalog, refs)) {
      expect(result.isError, ref).toBeFalsy()
    }
  })

  test('takes a page URL, a .md path or a bare key', async () => {
    const key = catalog.order.workflowsFeatured[0] ?? ''
    const results = await getEach(catalog, [
      `${ORIGIN}/workflows/${key}`,
      `/workflows/${key}.md`,
      key,
    ])
    for (const [ref, result] of results) {
      expect(result.structuredContent?.ref, ref).toBe(`workflow:${key}`)
    }
  })

  test('a miss suggests the closest refs', async () => {
    const key = catalog.order.workflowsFeatured[0] ?? ''
    const pinned = await call(catalog, 'get', { ref: `workflow:${key}@1` })
    expect(pinned.isError).toBe(true)
    expect(pinned.content[0]?.text).toContain(`Did you mean workflow:${key}`)
    const typo = await call(catalog, 'get', { ref: 'company:clya' })
    expect(typo.content[0]?.text).toContain('Did you mean company:clay')
  })
})

describe('get, on a fixture catalog', () => {
  const files: Array<ContentFile> = [
    {
      kind: 'tags',
      path: 'tags.yml',
      source:
        'capability:\n  manage-crm:\n    label: Manage a CRM\ncategory:\n  crm:\n    label: CRM\nchannel:\n  email:\n    label: Email\n',
    },
    {
      kind: 'company',
      path: 'companies/acme/company.md',
      handle: 'acme',
      source:
        '---\nname: Acme\ndomain: acme.example\ncategory: crm\nlogo: https://cdn.growth.engineer/icons/companies/acme-0123abcd.png\napi:\n  url: https://api.acme.example\n  auth: none\nupdated: 2026-09-16\n---\n',
    },
    {
      kind: 'tool',
      path: 'companies/acme/tools/create-record.md',
      handle: 'acme',
      slug: 'create-record',
      source:
        '---\nname: Create a record\nsummary: Creates one record.\ncapability: manage-crm\ndocs: https://docs.acme.example/records\napi: POST /records\naliases: [acme/old-record]\nupdated: 2026-09-16\n---\n',
    },
    {
      kind: 'tool',
      path: 'companies/acme/tools/draft-record.md',
      handle: 'acme',
      slug: 'draft-record',
      source:
        '---\nname: Draft\nsummary: Not yet.\ncapability: manage-crm\nstatus: draft\nupdated: 2026-09-16\n---\n',
    },
    {
      kind: 'workflow',
      path: 'workflows/old-way.md',
      name: 'old-way',
      source:
        '---\ntitle: The old way\nsummary: Kept for reference.\nauthor: jdoe\naliases: [acme]\nstatus: deprecated\nupdated: 2026-09-16\n---\n\n## Steps\n\n1. **Create** with [acme/create-record](../companies/acme/tools/create-record.md). Make one.\n\n## Done when\n\n- It exists.\n',
    },
  ]
  const catalog = buildCatalog(files)

  test('an old key returns the current file, under its current ref', async () => {
    const results = await getEach(catalog, [
      'tool:acme/old-record',
      'acme/old-record',
    ])
    for (const [ref, result] of results) {
      expect(result.structuredContent?.ref, ref).toBe('tool:acme/create-record')
    }
    // A live key wins over another kind's old one: `acme` is the company,
    // though a workflow was once called that.
    expect(
      (await call(catalog, 'get', { ref: 'acme' })).structuredContent?.ref
    ).toBe('company:acme')
    // Filters follow the rename too.
    expect(
      (await call(catalog, 'search', { uses: 'acme/old-record' })).isError
    ).toBeFalsy()
  })

  test('deprecated: hidden from search, returned by get with its status', async () => {
    const found = rows(await call(catalog, 'search', { query: 'old way' }))
    expect(found.map((row) => row.ref)).not.toContain('workflow:old-way')
    const result = await call(catalog, 'get', { ref: 'workflow:old-way' })
    expect(result.structuredContent?.status).toBe('deprecated')
    expect(result.content[0]?.text).toContain('status: deprecated')
  })

  test('a draft is never found, exactly like a key that does not exist', async () => {
    const draft = await call(catalog, 'get', { ref: 'tool:acme/draft-record' })
    const none = await call(catalog, 'get', { ref: 'tool:acme/no-such-tool' })
    expect(draft.isError).toBe(true)
    expect(none.isError).toBe(true)
    // Same answer, word for word, apart from the ref that was asked for.
    expect(draft.content[0]?.text.replace('acme/draft-record', 'X')).toBe(
      none.content[0]?.text.replace('acme/no-such-tool', 'X')
    )
  })
})

describe('submit_feedback', () => {
  const catalog = getCatalog()
  const posts: Array<{ url: string; init: RequestInit | undefined }> = []

  /** Notra, answering every post the same way. */
  function notraAnswers(status: number, body: unknown) {
    posts.length = 0
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      posts.push({ url: String(input), init })
      return Promise.resolve(Response.json(body, { status }))
    })
  }

  function sent(index: number): unknown {
    return JSON.parse(String(posts[index]?.init?.body))
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('posts the note and the client to the inbox, and says what was stored', async () => {
    notraAnswers(202, { feedback: { id: 'fb_1' }, deduplicated: false })
    const result = await call(
      catalog,
      'submit_feedback',
      {
        message: '  The enrich-person file names the wrong endpoint.  ',
        kind: 'bug',
        contextUrl: `${ORIGIN}/tools/apollo/enrich-person`,
      },
      'claude-code/2.0.0'
    )
    expect(result.isError).toBeFalsy()
    expect(result.content[0]?.text).toBe(
      'Thanks, the feedback was sent to the team.'
    )
    expect(result.structuredContent).toEqual({
      id: 'fb_1',
      deduplicated: false,
    })
    expect(posts).toHaveLength(1)
    expect(posts[0]?.url).toBe(FEEDBACK_URL)
    expect(posts[0]?.init?.method).toBe('POST')
    // The URL only takes feedback; no token goes with it.
    expect(new Headers(posts[0]?.init?.headers).has('authorization')).toBe(
      false
    )
    expect(sent(0)).toEqual({
      agentClient: 'claude-code/2.0.0',
      message: 'The enrich-person file names the wrong endpoint.',
      kind: 'bug',
      contextUrl: `${ORIGIN}/tools/apollo/enrich-person`,
    })
  })

  test('the client is cut to what Notra keeps, and left out when unknown', async () => {
    notraAnswers(202, { feedback: { id: 'fb_2' }, deduplicated: true })
    const again = await call(
      catalog,
      'submit_feedback',
      { message: 'Hi' },
      'x'.repeat(300)
    )
    expect(again.content[0]?.text).toBe('This feedback was already recorded.')
    expect((sent(0) as { agentClient: string }).agentClient).toHaveLength(200)
    await call(catalog, 'submit_feedback', { message: 'Hi' })
    expect(sent(1)).toEqual({ message: 'Hi' })
  })

  test.each([
    [{}, /Invalid arguments: message/],
    [{ message: '   ' }, /Invalid arguments: message/],
    [{ message: 'x', kind: 'rant' }, /Invalid arguments: kind/],
    [
      { message: 'x', contextUrl: 'not a url' },
      /Invalid arguments: contextUrl/,
    ],
    [{ message: 'x', agentClient: 'me' }, /Invalid arguments: Unrecognized/],
  ])(
    '%j is an error the agent can fix, and nothing is sent',
    async (args, message) => {
      notraAnswers(202, { feedback: { id: 'never' }, deduplicated: false })
      const result = await call(catalog, 'submit_feedback', args)
      expect(result.isError).toBe(true)
      expect(result.content[0]?.text).toMatch(message)
      expect(posts).toHaveLength(0)
    }
  )

  test('a refusal or a network failure is a result the agent can read, and is logged', async () => {
    const logged = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    notraAnswers(429, { error: 'Too many requests' })
    const refused = await call(catalog, 'submit_feedback', { message: 'Hi' })
    expect(refused.isError).toBe(true)
    expect(refused.content[0]?.text).toBe(
      'Feedback could not be submitted (429): Too many requests'
    )

    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('fetch failed')))
    const offline = await call(catalog, 'submit_feedback', { message: 'Hi' })
    expect(offline.isError).toBe(true)
    expect(offline.content[0]?.text).toBe(
      'Feedback could not be submitted: fetch failed'
    )
    expect(logged).toHaveBeenCalledTimes(2)
  })
})
