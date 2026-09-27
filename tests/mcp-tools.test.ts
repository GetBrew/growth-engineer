import { describe, expect, test } from 'vitest'
import { getCatalog } from '@/lib/catalog/catalog'
import { relationsOf } from '@/lib/catalog/relations'
import { buildCatalog, type Catalog } from '@/lib/content/build-catalog'
import type { ContentFile } from '@/lib/content/read-tree'
import { handleMessage } from '@/lib/mcp/server'

/**
 * What the two MCP tools answer, called the way a client calls them —
 * through `handleMessage` — against the real catalog (natural-language
 * queries, every filter, every kind of ref) and against a small fixture
 * catalog for what the real tree doesn't hold yet: a renamed key, a
 * deprecated workflow, a draft.
 */

const ORIGIN = 'https://example.test'

type Result = {
  content: Array<{ type: string; text: string }>
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

function call(catalog: Catalog, name: string, args: unknown): Result {
  const response = handleMessage(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    },
    { catalog, origin: ORIGIN }
  )
  if (!(response && 'result' in response)) {
    throw new Error(`no result: ${JSON.stringify(response)}`)
  }
  return response.result as Result
}

type Row = { ref: string; type: string; tags: Array<string>; author?: string }

function rows(result: Result): Array<Row> {
  return (result.structuredContent?.results ?? []) as Array<Row>
}

describe('search, on the real catalog', () => {
  const catalog = getCatalog()

  test('reads a sentence the way an agent writes it', () => {
    const outbound = call(catalog, 'search', { query: 'outbound workflow' })
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
      call(catalog, 'search', { query: 'enriching contacts' })
    )
    expect(enriching[0]?.tags).toContain('capability:enrich-contacts')

    const tools = rows(
      call(catalog, 'search', { query: 'the best tools for sending email' })
    )
    expect(tools.length).toBeGreaterThan(0)
    expect(tools.every((row) => row.type === 'tool')).toBe(true)
  })

  test('falls back to the closest matches instead of nothing', () => {
    const result = call(catalog, 'search', {
      query: 'enrich contacts zzzunmatchable',
    })
    expect(result.structuredContent?.isPartial).toBe(true)
    expect(rows(result).length).toBeGreaterThan(0)
  })

  test('browses with no words, featured workflows first', () => {
    const result = call(catalog, 'search', {})
    expect(rows(result)[0]?.ref).toBe(
      `workflow:${catalog.order.workflowsFeatured[0]}`
    )
    expect(result.structuredContent?.total).toBe(
      catalog.order.workflowsFeatured.length +
        catalog.order.toolsNew.length +
        catalog.order.companies.length
    )
  })

  test('filters: tags, company, uses and author', () => {
    const mcpWorkflows = rows(
      call(catalog, 'search', { tags: ['has:mcp'], type: 'workflow' })
    )
    expect(mcpWorkflows.every((row) => row.tags.includes('has:mcp'))).toBe(true)

    // Two tags in one namespace: either; across namespaces: both.
    const either = rows(
      call(catalog, 'search', {
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
      call(catalog, 'search', { company: company ?? '', limit: 50 })
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
      call(catalog, 'search', { uses: `tool:${toolKey}`, limit: 50 })
    )
    expect(users.map((row) => row.ref)).toEqual(
      relationsOf(catalog, `tool:${toolKey}`).workflows.map(
        (key) => `workflow:${key}`
      )
    )

    const author = workflow?.author ?? ''
    const byAuthor = rows(
      call(catalog, 'search', { author: author.toUpperCase(), limit: 50 })
    )
    expect(byAuthor.every((row) => row.author === author)).toBe(true)
    expect(byAuthor.length).toBeGreaterThan(0)
  })

  test('limit caps the rows; total says how many matched', () => {
    const result = call(catalog, 'search', { limit: 1 })
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
  ])('%j is an error the agent can fix', (args, message) => {
    const result = call(catalog, 'search', args)
    expect(result.isError).toBe(true)
    expect(result.content[0]?.text).toMatch(message)
  })
})

describe('get, on the real catalog', () => {
  const catalog = getCatalog()

  test('each kind returns its file and its links as refs', () => {
    for (const ref of [
      `company:${catalog.order.companies[0]}`,
      `tool:${catalog.order.toolsNew[0]}`,
      `workflow:${catalog.order.workflowsFeatured[0]}`,
    ]) {
      const result = call(catalog, 'get', { ref })
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

  test('a tag returns everything carrying it', () => {
    const result = call(catalog, 'get', { ref: 'capability:enrich-contacts' })
    expect(result.isError).toBeFalsy()
    expect(result.structuredContent?.type).toBe('tag')
    const tools = result.structuredContent?.tools as Array<string>
    expect(tools).toEqual(
      relationsOf(catalog, 'capability:enrich-contacts').tools.map(
        (key) => `tool:${key}`
      )
    )
    const searched = rows(
      call(catalog, 'search', {
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
    const byUrl = call(catalog, 'get', {
      ref: `${ORIGIN}/tags/capability/enrich-contacts.md`,
    })
    expect(byUrl.structuredContent?.ref).toBe('capability:enrich-contacts')
  })

  test('takes a page URL, a .md path or a bare key', () => {
    const key = catalog.order.workflowsFeatured[0] ?? ''
    for (const ref of [
      `${ORIGIN}/workflows/${key}`,
      `/workflows/${key}.md`,
      key,
    ]) {
      expect(call(catalog, 'get', { ref }).structuredContent?.ref, ref).toBe(
        `workflow:${key}`
      )
    }
  })

  test('a miss suggests the closest refs', () => {
    const key = catalog.order.workflowsFeatured[0] ?? ''
    const pinned = call(catalog, 'get', { ref: `workflow:${key}@1` })
    expect(pinned.isError).toBe(true)
    expect(pinned.content[0]?.text).toContain(`Did you mean workflow:${key}`)
    const typo = call(catalog, 'get', { ref: 'company:clya' })
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
        '---\nname: Acme\ndomain: acme.example\ncategory: crm\nlogo: acme.png\napi:\n  url: https://api.acme.example\n  auth: none\nupdated: 2026-09-16\n---\n',
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
        '---\ntitle: The old way\nsummary: Kept for reference.\nauthor: jdoe\nstatus: deprecated\nupdated: 2026-09-16\n---\n\n## Steps\n\n1. **Create** with [acme/create-record](../companies/acme/tools/create-record.md). Make one.\n\n## Done when\n\n- It exists.\n',
    },
  ]
  const catalog = buildCatalog(files, { logos: new Set(['acme.png']) })

  test('an old key returns the current file, under its current ref', () => {
    const result = call(catalog, 'get', { ref: 'tool:acme/old-record' })
    expect(result.structuredContent?.ref).toBe('tool:acme/create-record')
  })

  test('deprecated: hidden from search, returned by get with its status', () => {
    const found = rows(call(catalog, 'search', { query: 'old way' }))
    expect(found.map((row) => row.ref)).not.toContain('workflow:old-way')
    const result = call(catalog, 'get', { ref: 'workflow:old-way' })
    expect(result.structuredContent?.status).toBe('deprecated')
    expect(result.content[0]?.text).toContain('status: deprecated')
  })

  test('a draft is never found, exactly like a key that does not exist', () => {
    const draft = call(catalog, 'get', { ref: 'tool:acme/draft-record' })
    const none = call(catalog, 'get', { ref: 'tool:acme/no-such-tool' })
    expect(draft.isError).toBe(true)
    expect(none.isError).toBe(true)
    // Same answer, word for word, apart from the ref that was asked for.
    expect(draft.content[0]?.text.replace('acme/draft-record', 'X')).toBe(
      none.content[0]?.text.replace('acme/no-such-tool', 'X')
    )
  })
})
