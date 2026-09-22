import { convexTest } from 'convex-test'
import { beforeAll, describe, expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import {
  TOOL_FILE_MAX_LINES,
  WORKFLOW_FILE_MAX_LINES,
} from './model/render_markdown'
import schema from './schema'

/**
 * The seed is the first real caller of every public read, so the two are
 * tested together: seed once, then ask every question a page asks — as an
 * anonymous caller, because that is who reads the catalog.
 */

const modules = import.meta.glob('./**/*.*s')

describe('catalog', () => {
  const t = convexTest(schema, modules)

  beforeAll(async () => {
    const first = await t.mutation(internal.seed.run.run, {})
    expect(first.companies).toBe(25)
    expect(first.documents.rendered).toBeGreaterThan(0)
  })

  test('the seed is idempotent: a second run rewrites nothing', async () => {
    const second = await t.mutation(internal.seed.run.run, {})
    expect(second.documents.rendered).toBe(0)
    expect(second.documents.unchanged).toBe(
      second.companies + second.tools + second.workflows
    )
  })

  test('companies list and resolve by handle, anonymously', async () => {
    const companies = await t.query(api.companies.list, {})
    expect(companies.length).toBe(25)
    expect(companies.every((row) => row.category !== undefined)).toBe(true)
    // Lists carry a projection, never the document: no links, no search text.
    const clayRow = companies.find((row) => row.company.key === 'clay')
    expect(clayRow?.company.name).toBe('Clay')
    expect(clayRow?.company.logoUrl).toBe('/logos/clay.png')
    expect('links' in (clayRow?.company ?? {})).toBe(false)
    expect('searchText' in (clayRow?.company ?? {})).toBe(false)
    const category = clayRow?.category
    if (!category) {
      throw new Error('seeded Clay company must have a category')
    }
    const inCategory = await t.query(api.companies.list, {
      category: category.slug,
    })
    expect(inCategory.length).toBeGreaterThan(0)
    expect(
      inCategory.every((row) => row.category?.slug === category.slug)
    ).toBe(true)
    expect(await t.query(api.companies.list, { category: 'not-real' })).toEqual(
      []
    )
    const homeCompanies = await t.query(api.companies.list, {
      includeCategory: false,
      limit: 5,
    })
    expect(homeCompanies).toHaveLength(5)
    expect(homeCompanies.every((row) => row.category === undefined)).toBe(true)

    const clay = await t.query(api.companies.getByKey, { key: 'clay' })
    expect(clay?.name).toBe('Clay')
    expect(await t.query(api.companies.getByKey, { key: 'nobody' })).toBeNull()
  })

  test('a tool is ONE function of one company', async () => {
    const result = await t.query(api.tools.getByKey, {
      key: 'clay/enrich-contacts',
    })
    expect(result?.company.key).toBe('clay')
    expect(result?.tool.name).toBe('Enrich contacts')
    expect(result?.tool.agentLevel).toBe('unverified')
    // Every way in names the exact call — that is what makes it one function.
    expect(
      result?.tool.access.every((entry) => entry.operation.length > 0)
    ).toBe(true)
    // The product is not a listing: there is no `clay/clay`.
    expect(await t.query(api.tools.getByKey, { key: 'clay/clay' })).toBeNull()
  })

  test('one company lists many tools', async () => {
    const clay = await t.query(api.tools.listByCompany, { companyKey: 'clay' })
    expect(clay.map((tool) => tool.key).sort()).toEqual([
      'clay/build-audience',
      'clay/enrich-contacts',
      'clay/find-work-emails',
    ])
  })

  test('a tool with no verified way in is not published, but its company lists', async () => {
    expect(
      await t.query(api.tools.getByKey, { key: 'salesforce/manage-crm' })
    ).toBeNull()
    expect(
      await t.query(api.companies.getByKey, { key: 'salesforce' })
    ).not.toBeNull()
  })

  test('workflow lists honour sort, and there is only one kind', async () => {
    const trending = await t.query(api.workflows.list, { sort: 'trending' })
    expect(trending.length).toBe(12)
    expect(trending[0]?.workflow.key).toBe('brew/funding-signal-outbound')
    // A row is a summary plus each tool's company and ways in — no `format`.
    expect(Object.keys(trending[0]?.workflow ?? {}).sort()).toEqual([
      '_id',
      'key',
      'summary',
      'title',
      'toolCount',
    ])
    const firstTools = trending[0]?.tools ?? []
    expect(
      Object.fromEntries(
        firstTools.map((tool) => [tool.companyKey, tool.access])
      )
    ).toMatchObject({ apollo: ['api'], brew: ['mcp', 'api'], clay: ['api'] })
    expect(firstTools.every((tool) => !('key' in tool))).toBe(true)
    // Each sort reads its own index and returns the same set in a different
    // order — a growth hack is a workflow, so nothing filters them apart.
    const top = await t.query(api.workflows.list, { sort: 'top' })
    const fresh = await t.query(api.workflows.list, { sort: 'new' })
    expect(top).toHaveLength(12)
    expect(fresh).toHaveLength(12)
    expect(top.map((row) => row.workflow.key).sort()).toEqual(
      trending.map((row) => row.workflow.key).sort()
    )

    const email = await t.query(api.workflows.list, {
      sort: 'trending',
      tag: 'channel:email',
    })
    expect(email.map((row) => row.workflow.key)).toContain(
      'brew/funding-signal-outbound'
    )
    expect(email.map((row) => row.workflow.key)).not.toContain(
      'brew/high-intent-visitors'
    )
    expect(
      await t.query(api.workflows.list, {
        sort: 'trending',
        tag: 'channel:not-real',
      })
    ).toEqual([])
  })

  test('workflow search composes words, sort and tag', async () => {
    const results = await t.query(api.workflows.search, {
      q: 'email',
      sort: 'new',
      tag: 'channel:email',
    })
    expect(results.length).toBeGreaterThan(0)
    expect(
      await t.query(api.workflows.search, {
        q: 'email',
        tag: 'channel:not-real',
      })
    ).toEqual([])
  })

  test('a workflow page has its version, tools and history', async () => {
    const result = await t.query(api.workflows.getByKey, {
      key: 'brew/clay-waterfall-order',
    })
    expect(result?.version.version).toBe(1)
    expect(result?.tools.map((entry) => entry.tool.key)).toEqual([
      'clay/find-work-emails',
    ])
    expect(result?.versions).toHaveLength(1)
    expect(
      await t.query(api.workflows.getByKey, {
        key: 'brew/clay-waterfall-order',
        version: 2,
      })
    ).toBeNull()
  })

  test('workflows are reachable from the tools and companies they use', async () => {
    const byTool = await t.query(api.workflows.listByTool, {
      toolKey: 'brew/write-copy',
    })
    expect(byTool.length).toBeGreaterThan(3)
    const byCompany = await t.query(api.workflows.listByCompany, {
      companyKey: 'clay',
    })
    expect(byCompany.map((row) => row.workflow.key)).toContain(
      'brew/clay-waterfall-order'
    )
  })

  test('every file is rendered, within its line cap, and reachable by ref', async () => {
    const refs = await t.query(api.documents.listRefs, {})
    // 25 companies + 42 per-function tools + 12 workflows.
    expect(refs.length).toBe(25 + 42 + 12)
    const documents = await Promise.all(
      refs.map(({ ref }) => t.query(api.documents.getByRef, { ref }))
    )
    refs.forEach(({ ref }, index) => {
      const document = documents[index]
      expect(document, ref).not.toBeNull()
      const cap = ref.startsWith('workflow:')
        ? WORKFLOW_FILE_MAX_LINES
        : TOOL_FILE_MAX_LINES
      expect(document?.lineCount, ref).toBeLessThanOrEqual(cap)
    })
    const clay = await t.query(api.documents.getByRef, {
      ref: 'tool:clay/enrich-contacts',
    })
    expect(clay?.markdown).toContain('# Enrich contacts')
    expect(clay?.markdown.trimEnd().endsWith('- Never print API keys.')).toBe(
      true
    )
  })

  test('search: derived chips filter from the row, curated chips from taggings', async () => {
    const mcp = await t.query(api.tools.search, { q: '', chips: ['has:mcp'] })
    expect(mcp.results.length).toBeGreaterThan(0)
    expect(mcp.results.every((card) => card.tool.access.includes('mcp'))).toBe(
      true
    )
    expect(Object.keys(mcp.results[0]?.tool ?? {}).sort()).toEqual([
      '_id',
      'access',
      'agentLevel',
      'key',
      'name',
      'summary',
    ])

    // Category chips browse from the company: every data provider's tools.
    const dataProviders = await t.query(api.tools.search, {
      q: '',
      chips: ['category:data-provider'],
    })
    expect(dataProviders.results.map((card) => card.tool.key)).toContain(
      'clay/enrich-contacts'
    )
    expect(
      dataProviders.results.every(
        (card) => card.category?.slug === 'data-provider'
      )
    ).toBe(true)

    // A tool IS its capability now, so it is no longer TAGGED with one: the
    // capability namespace belongs to workflows. Words still reach it, through
    // the tool's name and the vocabulary's synonyms in `searchText`.
    const enrich = await t.query(api.tools.search, {
      q: 'enrichment',
      chips: [],
    })
    expect(enrich.results.map((card) => card.tool.key)).toContain(
      'clay/enrich-contacts'
    )

    const capabilityChip = await t.query(api.tools.search, {
      q: '',
      chips: ['capability:enrich-contacts'],
    })
    expect(capabilityChip.results).toEqual([])

    const nonsense = await t.query(api.tools.search, {
      q: '',
      chips: ['category:nonexistent'],
    })
    expect(nonsense.results).toEqual([])
  })

  test('tags: the derived namespaces exist and counts are projections of taggings', async () => {
    const agent = await t.query(api.tags.listActive, { namespace: 'agent' })
    expect(agent.map((tag) => tag.slug).sort()).toEqual([
      'friendly',
      'native',
      'possible',
      'unverified',
    ])
    const unverified = agent.find((tag) => tag.slug === 'unverified')
    // 42 seeded tools; the 5 whose product has no verifiable way in are
    // in_review and unlisted, so they are not counted.
    expect(unverified?.counts.tools).toBe(37)
    expect(unverified?.derived).toBe(true)
  })

  test('the file index keeps listing a file while it waits to re-render', async () => {
    const before = await t.query(api.documents.listRefs, {})
    // A tool edit marks its own file, its company's and every dependent
    // workflow's stale. None of them stop serving, so none may vanish from
    // /llms.txt while the render queue catches up.
    const clay = await t.run(
      async (ctx) =>
        await ctx.db
          .query('tools')
          .withIndex('by_key', (q) => q.eq('key', 'clay/enrich-contacts'))
          .unique()
    )
    if (!clay) {
      throw new Error('the seed must contain clay/enrich-contacts')
    }
    const marked = await t.mutation(internal.documents.markToolStale, {
      toolId: clay._id,
    })
    expect(marked).toBeGreaterThan(1)
    const after = await t.query(api.documents.listRefs, {})
    expect(after).toHaveLength(before.length)
    expect(after.map((row) => row.ref).sort()).toEqual(
      before.map((row) => row.ref).sort()
    )
  })

  test('an unknown key has no alias', async () => {
    expect(
      await t.query(api.aliases.resolve, {
        entityType: 'tool',
        key: 'nope/nope',
      })
    ).toBeNull()
  })
})
