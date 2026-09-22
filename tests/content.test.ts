import { beforeAll, describe, expect, test } from 'vitest'
import { parseRef } from '@/lib/catalog/keys'
import {
  TOOL_FILE_MAX_LINES,
  WORKFLOW_FILE_MAX_LINES,
} from '@/lib/catalog/render-markdown'
import {
  searchCompanies,
  searchTools,
  searchWorkflows,
} from '@/lib/catalog/search'
import { buildCatalog, type Catalog } from '@/lib/content/build-catalog'
import { readContentTree } from '@/lib/content/read-tree'

/**
 * THE CONTENT SUITE (`pnpm content:check`): the real tree under companies/,
 * workflows/ and tags/ builds, and answers every question a page asks. This
 * is what CI runs on a contributor's pull request, so a bad file fails here
 * with its path, not in a deploy.
 */

describe('the content tree', () => {
  let catalog: Catalog

  beforeAll(() => {
    const tree = readContentTree()
    expect(tree.problems).toEqual([])
    catalog = buildCatalog(tree.files, {
      logos: tree.logos,
      problems: tree.problems,
    })
  })

  test('builds with every file accounted for, whatever the tree holds', () => {
    // Relative to the tree, never absolute: a contributor's first company must
    // not fail this suite. The seed is the floor.
    const tree = readContentTree()
    const files = (kind: string) =>
      tree.files.filter((file) => file.kind === kind).length
    const drafts = tree.files.filter(
      (file) => file.kind === 'tool' && /^status: draft$/m.test(file.source)
    ).length
    expect(catalog.companies.size).toBe(files('company'))
    expect(catalog.tools.size).toBe(files('tool') - drafts)
    expect(catalog.workflows.size).toBe(files('workflow'))
    expect(catalog.tags.size).toBe(files('tag') + 7)
    expect(catalog.companies.size).toBeGreaterThanOrEqual(25)
    expect(catalog.tools.size).toBeGreaterThanOrEqual(37)
    expect(catalog.workflows.size).toBeGreaterThanOrEqual(12)
    expect(
      [...catalog.companies.values()].every((company) =>
        catalog.tags.has(`category:${company.category}`)
      )
    ).toBe(true)
  })

  test('a tool is ONE function of one company', () => {
    const tool = catalog.tools.get('clay/enrich-contacts')
    expect(tool?.companyKey).toBe('clay')
    expect(tool?.name).toBe('Enrich contacts')
    expect(tool?.agentLevel).toBe('unverified')
    expect(tool?.tags).toEqual(['agent:unverified', 'has:api'])
    // Every way in names the exact call — that is what makes it one function.
    expect(tool?.access.every((entry) => entry.operation.length > 0)).toBe(true)
    // The product is not a listing: there is no `clay/clay`.
    expect(catalog.tools.has('clay/clay')).toBe(false)
  })

  test('one company lists many tools, in key order', () => {
    expect(catalog.toolsByCompany.get('clay')).toEqual([
      'clay/build-audience',
      'clay/enrich-contacts',
      'clay/find-work-emails',
    ])
  })

  test('a draft tool has no page and no file, but its company is listed', () => {
    expect(catalog.tools.has('salesforce/manage-crm')).toBe(false)
    expect(catalog.documents.has('tool:salesforce/manage-crm')).toBe(false)
    expect(catalog.companies.has('salesforce')).toBe(true)
  })

  test('workflow orders: featured is editorial, new is by date, same set', () => {
    expect(catalog.order.workflowsFeatured[0]).toBe(
      'brew/funding-signal-outbound'
    )
    expect(catalog.order.workflowsFeatured).toHaveLength(catalog.workflows.size)
    expect([...catalog.order.workflowsNew].sort()).toEqual(
      [...catalog.order.workflowsFeatured].sort()
    )
  })

  test('a single-tool workflow names its one tool and its version', () => {
    const workflow = catalog.workflows.get('brew/clay-waterfall-order')
    expect(workflow?.version).toBe(1)
    expect(workflow?.toolKeys).toEqual(['clay/find-work-emails'])
    expect(workflow?.toolCount).toBe(1)
    expect(workflow?.ownerKey).toBe('brew')
  })

  test('workflows are reachable from the tools and companies they use', () => {
    expect(
      (catalog.workflowsByTool.get('brew/write-copy') ?? []).length
    ).toBeGreaterThan(3)
    expect(catalog.workflowsByCompany.get('clay')).toContain(
      'brew/clay-waterfall-order'
    )
  })

  test('every file is rendered, within its line cap, and reachable by ref', () => {
    expect(catalog.documents.size).toBe(
      catalog.companies.size + catalog.tools.size + catalog.workflows.size
    )
    for (const document of catalog.documents.values()) {
      const cap =
        document.entityType === 'workflow'
          ? WORKFLOW_FILE_MAX_LINES
          : TOOL_FILE_MAX_LINES
      expect(document.lineCount, document.ref).toBeLessThanOrEqual(cap)
      expect(parseRef(document.ref), document.ref).not.toBeNull()
    }
    const clay = catalog.documents.get('tool:clay/enrich-contacts')
    expect(clay?.markdown).toContain('# Enrich contacts')
    expect(clay?.markdown).toContain('ref: tool:clay/enrich-contacts')
    expect(clay?.markdown.trimEnd().endsWith('- Never print API keys.')).toBe(
      true
    )
  })

  test('two builds of the same tree render byte-identical files', () => {
    const tree = readContentTree()
    const again = buildCatalog(tree.files, { logos: tree.logos })
    for (const [ref, document] of catalog.documents) {
      expect(again.documents.get(ref)?.hash, ref).toBe(document.hash)
      expect(again.documents.get(ref)?.markdown, ref).toBe(document.markdown)
    }
  })

  test('search: chips filter on facts, words on the search text', () => {
    const mcp = searchTools(catalog, { q: '', chips: ['has:mcp'], limit: 60 })
    expect(mcp.results.length).toBeGreaterThan(0)
    expect(mcp.results.every((card) => card.tool.access.includes('mcp'))).toBe(
      true
    )
    expect(mcp.chips).toEqual(['has:mcp'])

    const enrich = searchTools(catalog, {
      q: 'enrichment',
      chips: [],
      limit: 60,
    })
    expect(enrich.results.map((card) => card.tool.key)).toContain(
      'clay/enrich-contacts'
    )

    // A tool IS its capability, so the capability chip finds every provider.
    const capability = searchTools(catalog, {
      q: '',
      chips: ['capability:enrich-contacts'],
      limit: 60,
    })
    expect(capability.results.map((card) => card.tool.key).sort()).toEqual([
      'apollo/enrich-contacts',
      'attio/enrich-contacts',
      'clay/enrich-contacts',
    ])

    // Category chips browse from the company: every data provider's tools.
    const dataProviders = searchTools(catalog, {
      q: '',
      chips: ['category:data-provider'],
      limit: 60,
    })
    expect(dataProviders.results.map((card) => card.tool.key)).toContain(
      'clay/enrich-contacts'
    )
    expect(
      dataProviders.results.every(
        (card) => card.category?.slug === 'data-provider'
      )
    ).toBe(true)

    expect(
      searchTools(catalog, {
        q: '',
        chips: ['category:nonexistent'],
        limit: 60,
      }).results
    ).toEqual([])
  })

  test('search: workflows by words and tag, companies by words and category', () => {
    const email = searchWorkflows(catalog, {
      q: 'email',
      sort: 'featured',
      tag: 'channel:email',
      limit: 30,
    })
    expect(email.length).toBeGreaterThan(0)
    expect(
      searchWorkflows(catalog, {
        q: 'email',
        sort: 'new',
        tag: 'channel:not-real',
        limit: 30,
      })
    ).toEqual([])
    const clay = searchCompanies(catalog, {
      q: 'Clay',
      category: 'data-provider',
      limit: 50,
    })
    expect(clay.map((row) => row.company.key)).toContain('clay')
    expect(searchCompanies(catalog, { q: '', limit: 50 })).toEqual([])
  })

  test('tags: the derived namespaces exist and counts are projections', () => {
    const agent = [...catalog.tags.values()].filter(
      (tag) => tag.namespace === 'agent'
    )
    expect(agent.map((tag) => tag.slug).sort()).toEqual([
      'friendly',
      'native',
      'possible',
      'unverified',
    ])
    const unverified = catalog.tags.get('agent:unverified')
    expect(unverified?.counts.tools).toBe(
      [...catalog.tools.values()].filter(
        (tool) =>
          tool.status === 'published' && tool.agentLevel === 'unverified'
      ).length
    )
    expect(unverified?.derived).toBe(true)
    expect(
      catalog.tags.get('category:data-provider')?.counts.companies
    ).toBeGreaterThan(0)
    expect(catalog.tags.get('channel:email')?.counts.workflows).toBeGreaterThan(
      0
    )
  })

  test('an unknown key has no alias', () => {
    expect(catalog.aliases.get('tool:nope/nope')).toBeUndefined()
  })
})
