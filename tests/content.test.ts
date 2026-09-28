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
    const isDraft = (source: string) => /^status: draft$/m.test(source)
    const drafts = (kind: string) =>
      tree.files.filter((file) => file.kind === kind && isDraft(file.source))
        .length
    // A company has a page once it has a tool that is not a draft.
    const makers = new Set(
      tree.files.flatMap((file) =>
        file.kind === 'tool' && !isDraft(file.source) ? [file.handle] : []
      )
    )
    expect(catalog.companies.size).toBe(makers.size)
    expect(catalog.tools.size).toBe(files('tool') - drafts('tool'))
    expect(catalog.workflows.size).toBe(files('workflow') - drafts('workflow'))
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
    // The floor: the seed catalog cannot silently empty.
    expect(catalog.companies.size).toBeGreaterThanOrEqual(10)
    expect(catalog.tools.size).toBeGreaterThanOrEqual(10)
    expect(catalog.workflows.size).toBeGreaterThanOrEqual(3)
    expect(
      [...catalog.companies.values()].every((company) =>
        catalog.tags.has(`category:${company.category}`)
      )
    ).toBe(true)
  })

  test('a tool is ONE function of one company', () => {
    for (const tool of catalog.tools.values()) {
      expect(tool.key.startsWith(`${tool.companyKey}/`), tool.key).toBe(true)
      expect(catalog.companies.has(tool.companyKey), tool.key).toBe(true)
      // Its tags are computed: the capability, its company's category, its ways in.
      const company = catalog.companies.get(tool.companyKey)
      expect(tool.tags.slice(0, 2), tool.key).toEqual([
        `capability:${tool.capability}`,
        `category:${company?.category}`,
      ])
      // Every way in names the exact call — that is what makes it one function.
      expect(tool.access.length, tool.key).toBeGreaterThan(0)
      expect(
        tool.access.every((entry) => entry.operation.length > 0),
        tool.key
      ).toBe(true)
    }
  })

  test('a company lists its published tools, in key order', () => {
    for (const company of catalog.companies.values()) {
      const tools = relationsOf(catalog, `company:${company.key}`).tools
      expect(tools, company.key).toEqual([...tools].sort())
      for (const key of tools) {
        expect(catalog.tools.get(key)?.companyKey, key).toBe(company.key)
        expect(catalog.tools.get(key)?.status, key).toBe('published')
      }
    }
  })

  test('a draft has no page and no file; a company of drafts has neither', () => {
    const tree = readContentTree()
    for (const file of tree.files) {
      if (file.kind !== 'tool' || !/^status: draft$/m.test(file.source)) {
        continue
      }
      const key = `${file.handle}/${file.slug}`
      expect(catalog.tools.has(key), key).toBe(false)
      expect(catalog.documents.has(`tool:${key}`), key).toBe(false)
    }
    for (const company of catalog.companies.values()) {
      expect(
        [...catalog.tools.values()].some(
          (tool) => tool.companyKey === company.key
        ),
        company.key
      ).toBe(true)
    }
  })

  test('workflow orders: featured is editorial, new is by date, same set', () => {
    const ranked = [...catalog.workflows.values()]
      .filter((workflow) => workflow.featured !== undefined)
      .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))
    expect(catalog.order.workflowsFeatured.slice(0, ranked.length)).toEqual(
      ranked.map((workflow) => workflow.key)
    )
    expect([...catalog.order.workflowsNew].sort()).toEqual(
      [...catalog.order.workflowsFeatured].sort()
    )
  })

  test('workflows are by people and count their tools', () => {
    for (const workflow of catalog.workflows.values()) {
      expect(workflow.toolCount, workflow.key).toBe(workflow.toolKeys.length)
      // Workflows are by people: a GitHub login, never a company handle.
      expect(catalog.companies.has(workflow.author), workflow.key).toBe(false)
    }
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
    for (const workflow of catalog.workflows.values()) {
      for (const toolKey of workflow.toolKeys) {
        const companyKey = catalog.tools.get(toolKey)?.companyKey ?? ''
        expect(
          relationsOf(catalog, `company:${companyKey}`).workflows,
          `${companyKey} ← ${workflow.key}`
        ).toContain(workflow.key)
      }
    }
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
    for (const tool of catalog.tools.values()) {
      const file = catalog.documents.get(`tool:${tool.key}`)?.markdown ?? ''
      expect(file, tool.key).toContain(`# ${tool.name}`)
      expect(file, tool.key).toContain(`ref: tool:${tool.key}`)
      expect(file.trimEnd().endsWith('- Never print API keys.'), tool.key).toBe(
        true
      )
    }
  })

  test('every rendered header parses back to its entity', () => {
    const header = (ref: string) =>
      parse(
        /^---\n([\s\S]*?)\n---/.exec(
          catalog.documents.get(ref)?.markdown ?? ''
        )?.[1] ?? '',
        { schema: 'core' }
      ) as Record<string, unknown>
    for (const tool of catalog.tools.values()) {
      const fields = header(`tool:${tool.key}`)
      expect(fields.ref, tool.key).toBe(`tool:${tool.key}`)
      expect(fields.name, tool.key).toBe(tool.name)
      expect(fields.company, tool.key).toBe(`company:${tool.companyKey}`)
      expect(fields.tags, tool.key).toEqual([...tool.tags].sort())
    }
    for (const workflow of catalog.workflows.values()) {
      const fields = header(`workflow:${workflow.key}`)
      expect(fields.title, workflow.key).toBe(workflow.title)
      expect(fields.author, workflow.key).toBe(workflow.author)
      expect(fields.tools, workflow.key).toEqual(
        workflow.toolKeys.map((key) => `tool:${key}`)
      )
    }
    for (const company of catalog.companies.values()) {
      expect(header(`company:${company.key}`).name, company.key).toBe(
        company.name
      )
    }
  })

  test('every tag has a file listing what carries it', () => {
    for (const tag of catalog.tags.values()) {
      const markdown = catalog.tagDocuments.get(tag.key)?.markdown ?? ''
      const fields = parse(/^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? '', {
        schema: 'core',
      }) as Record<string, unknown>
      expect(fields.ref, tag.key).toBe(tag.key)
      expect(fields.label, tag.key).toBe(tag.label)
      const members = relationsOf(catalog, tag.key)
      expect(fields.tools, tag.key).toEqual(
        members.tools.map((key) => `tool:${key}`)
      )
      expect(fields.workflows, tag.key).toEqual(
        members.workflows.map((key) => `workflow:${key}`)
      )
    }
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

    // A synonym finds the tool: every tool is found by each of its
    // capability's synonyms.
    for (const tool of catalog.tools.values()) {
      if (tool.status !== 'published') {
        continue
      }
      const capability = catalog.tags.get(`capability:${tool.capability}`)
      for (const synonym of capability?.synonyms ?? []) {
        expect(
          searchToolItems(tools, { q: synonym, chips: [] }).results.map(
            (card) => card.tool.key
          ),
          `${synonym} → ${tool.key}`
        ).toContain(tool.key)
      }
    }

    // The capability chip finds every provider of the capability, and only them.
    for (const tag of catalog.tags.values()) {
      if (tag.namespace !== 'capability' || tag.counts.tools === 0) {
        continue
      }
      const found = searchToolItems(tools, { q: '', chips: [tag.key] }).results
      expect(found.map((card) => card.tool.key).sort(), tag.key).toEqual(
        relationsOf(catalog, tag.key).tools.slice().sort()
      )
    }

    // Category chips browse from the company: every tool of that kind of company.
    const [category] = [...catalog.companies.values()].map(
      (company) => company.category
    )
    const byCategory = searchToolItems(tools, {
      q: '',
      chips: [`category:${category}`],
    })
    expect(byCategory.results.length).toBeGreaterThan(0)
    expect(
      byCategory.results.every((card) => card.category?.slug === category)
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
    const [first] = catalog.workflows.values()
    const author = first?.author ?? ''
    expect(
      searchWorkflowItems(workflows, { q: author, sort: 'new' }).length
    ).toBe(
      [...catalog.workflows.values()].filter(
        (workflow) => workflow.author === author
      ).length
    )

    const companies = catalog.order.companies.flatMap((key) => {
      const company = catalog.companies.get(key)
      return company ? [companySearchItem(catalog, company)] : []
    })
    for (const row of companies) {
      expect(
        searchCompanyItems(companies, {
          q: row.company.name,
          category: row.category?.slug,
        }).map((found) => found.company.key),
        row.company.key
      ).toContain(row.company.key)
    }
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
