import { beforeAll, describe, expect, test } from 'vitest'
import { parse } from 'yaml'
import { parseRef } from '@/lib/catalog/keys'
import {
  companySearchItem,
  toolSearchItem,
  workflowSearchItem,
} from '@/lib/catalog/lists'
import { relationsOf } from '@/lib/catalog/relations'
import {
  TOOL_FILE_MAX_LINES,
  WORKFLOW_FILE_MAX_LINES,
} from '@/lib/catalog/render-markdown'
import {
  searchCompanyItems,
  searchToolItems,
  searchWorkflowItems,
} from '@/lib/catalog/search'
import { buildCatalog, type Catalog } from '@/lib/content/build-catalog'
import { readContentTree } from '@/lib/content/read-tree'

/**
 * THE CONTENT SUITE (`pnpm content:check`): the real tree under companies/,
 * workflows/ and tags.yml builds, and answers every question a page asks. This
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
    // Every tags.yml entry, plus the three derived `has:*`.
    const vocabulary = parse(
      tree.files.find((file) => file.kind === 'tags')?.source ?? '',
      { schema: 'core' }
    ) as Record<string, Record<string, unknown>>
    const entries = Object.values(vocabulary).reduce(
      (sum, namespace) => sum + Object.keys(namespace).length,
      0
    )
    expect(catalog.tags.size).toBe(entries + 3)
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
    // Its tags are computed: the capability, its company's category, its ways in.
    expect(tool?.tags).toEqual([
      'capability:enrich-contacts',
      'category:data-provider',
      'has:api',
    ])
    // Every way in names the exact call — that is what makes it one function.
    expect(tool?.access.every((entry) => entry.operation.length > 0)).toBe(true)
    // The product is not a listing: there is no `clay/clay`.
    expect(catalog.tools.has('clay/clay')).toBe(false)
  })

  test('one company lists many tools, in key order', () => {
    expect(relationsOf(catalog, 'company:clay').tools).toEqual([
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
    expect(catalog.order.workflowsFeatured[0]).toBe('funding-signal-outbound')
    expect(catalog.order.workflowsFeatured).toHaveLength(catalog.workflows.size)
    expect([...catalog.order.workflowsNew].sort()).toEqual(
      [...catalog.order.workflowsFeatured].sort()
    )
  })

  test('a single-tool workflow names its one tool and its author', () => {
    const workflow = catalog.workflows.get('clay-waterfall-order')
    expect(workflow?.toolKeys).toEqual(['clay/find-work-emails'])
    expect(workflow?.toolCount).toBe(1)
    // Workflows are by people: a GitHub login, never a company handle.
    expect(workflow?.author).toBe('thedogwiththedataonit')
  })

  test('every workflow is built from tools, and the links run both ways', () => {
    for (const workflow of catalog.workflows.values()) {
      expect(workflow.toolKeys.length, workflow.key).toBeGreaterThan(0)
      for (const toolKey of workflow.toolKeys) {
        expect(catalog.tools.has(toolKey), `${workflow.key} → ${toolKey}`).toBe(
          true
        )
        expect(
          relationsOf(catalog, `tool:${toolKey}`).workflows,
          `${toolKey} ← ${workflow.key}`
        ).toContain(workflow.key)
      }
      // The rendered files carry the relationship in both directions.
      const file =
        catalog.documents.get(`workflow:${workflow.key}`)?.markdown ?? ''
      expect(file).toContain(`author: ${workflow.author}`)
      for (const toolKey of workflow.toolKeys) {
        expect(file, workflow.key).toContain(`tool:${toolKey}`)
        const toolFile =
          catalog.documents.get(`tool:${toolKey}`)?.markdown ?? ''
        expect(toolFile, toolKey).toContain(`workflow:${workflow.key}`)
      }
    }
    for (const toolKey of catalog.tools.keys()) {
      for (const workflowKey of relationsOf(catalog, `tool:${toolKey}`)
        .workflows) {
        expect(
          catalog.workflows.get(workflowKey)?.toolKeys,
          `${toolKey} ← ${workflowKey}`
        ).toContain(toolKey)
      }
    }
    // A tool no workflow uses says so, in the same header line.
    const unused = [...catalog.tools.keys()].find(
      (key) => relationsOf(catalog, `tool:${key}`).workflows.length === 0
    )
    expect(unused).toBeDefined()
    expect(catalog.documents.get(`tool:${unused}`)?.markdown).toContain(
      'workflows: []'
    )
  })

  test('workflows are reachable from the tools and companies they use', () => {
    expect(
      relationsOf(catalog, 'tool:brew/write-copy').workflows.length
    ).toBeGreaterThan(3)
    expect(relationsOf(catalog, 'company:clay').workflows).toContain(
      'clay-waterfall-order'
    )
    // A workflow's capabilities are its tools' capabilities, never typed twice.
    for (const workflow of catalog.workflows.values()) {
      const capabilities = workflow.toolKeys.map(
        (key) => `capability:${catalog.tools.get(key)?.capability}`
      )
      expect(
        workflow.tags.filter((tag) => tag.startsWith('capability:')).sort(),
        workflow.key
      ).toEqual([...new Set(capabilities)].sort())
    }
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
      expect(again.documents.get(ref)?.markdown, ref).toBe(document.markdown)
    }
  })

  test('search: chips filter on facts, words on the search text', () => {
    const tools = catalog.order.toolsNew.flatMap((key) => {
      const tool = catalog.tools.get(key)
      return tool ? [toolSearchItem(catalog, tool)] : []
    })
    const mcp = searchToolItems(tools, { q: '', chips: ['has:mcp'] })
    expect(mcp.results.length).toBeGreaterThan(0)
    expect(mcp.results.every((card) => card.tool.access.includes('mcp'))).toBe(
      true
    )
    expect(mcp.chips).toEqual(['has:mcp'])

    const enrich = searchToolItems(tools, { q: 'enrichment', chips: [] })
    expect(enrich.results.map((card) => card.tool.key)).toContain(
      'clay/enrich-contacts'
    )

    // A tool IS its capability, so the capability chip finds every provider.
    const capability = searchToolItems(tools, {
      q: '',
      chips: ['capability:enrich-contacts'],
    })
    expect(capability.results.map((card) => card.tool.key).sort()).toEqual([
      'apollo/enrich-contacts',
      'attio/enrich-contacts',
      'clay/enrich-contacts',
    ])

    // Category chips browse from the company: every data provider's tools.
    const dataProviders = searchToolItems(tools, {
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

    expect(
      searchToolItems(tools, { q: '', chips: ['category:nonexistent'] }).results
    ).toEqual([])
  })

  test('search: workflows by words, author and tag; companies by words and category', () => {
    const workflows = catalog.order.workflowsFeatured.flatMap((key, index) => {
      const workflow = catalog.workflows.get(key)
      return workflow ? [workflowSearchItem(catalog, workflow, index)] : []
    })
    expect(
      searchWorkflowItems(workflows, { q: '', sort: 'featured' }).map(
        (row) => row.workflow.key
      )
    ).toEqual(catalog.order.workflowsFeatured)
    const email = searchWorkflowItems(workflows, {
      q: 'email',
      sort: 'featured',
      tag: 'channel:email',
    })
    expect(email.length).toBeGreaterThan(0)
    expect(
      searchWorkflowItems(workflows, {
        q: 'email',
        sort: 'new',
        tag: 'channel:not-real',
      })
    ).toEqual([])
    // The author is searchable: a person's workflows, by login.
    expect(
      searchWorkflowItems(workflows, {
        q: 'thedogwiththedataonit',
        sort: 'new',
      }).length
    ).toBe(catalog.workflows.size)

    const companies = catalog.order.companies.flatMap((key) => {
      const company = catalog.companies.get(key)
      return company ? [companySearchItem(catalog, company)] : []
    })
    const clay = searchCompanyItems(companies, {
      q: 'Clay',
      category: 'data-provider',
    })
    expect(clay.map((row) => row.company.key)).toContain('clay')
    expect(searchCompanyItems(companies, { q: '' })).toHaveLength(
      catalog.order.companies.length
    )

    // A workflow is found by the vendor of every tool it uses: each row
    // shows that vendor's logo, so its name must find the row.
    for (const workflow of catalog.workflows.values()) {
      for (const toolKey of workflow.toolKeys) {
        const handle = toolKey.split('/')[0] ?? ''
        expect(
          searchWorkflowItems(workflows, { q: handle, sort: 'new' }).map(
            (row) => row.workflow.key
          ),
          `${handle} → ${workflow.key}`
        ).toContain(workflow.key)
      }
    }
    // A company is found by the description its row shows.
    for (const company of catalog.companies.values()) {
      const word = (company.description ?? '')
        .split(/\W+/)
        .find((part) => part.length > 6)
      if (word) {
        expect(
          searchCompanyItems(companies, { q: word }).map(
            (row) => row.company.key
          ),
          `${word} → ${company.key}`
        ).toContain(company.key)
      }
    }
    // Punctuation is not a query for everything.
    expect(searchCompanyItems(companies, { q: '???' })).toEqual([])
    expect(searchWorkflowItems(workflows, { q: '—', sort: 'new' })).toEqual([])
  })

  test('tags: the derived namespaces exist and counts are projections', () => {
    const has = [...catalog.tags.values()].filter(
      (tag) => tag.namespace === 'has'
    )
    expect(has.map((tag) => tag.slug).sort()).toEqual(['api', 'cli', 'mcp'])
    // A tag's count is the length of its relations: one writer for both.
    for (const tag of catalog.tags.values()) {
      const members = relationsOf(catalog, tag.key)
      expect(tag.counts, tag.key).toEqual({
        companies: members.companies.length,
        tools: members.tools.length,
        workflows: members.workflows.length,
      })
    }
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
