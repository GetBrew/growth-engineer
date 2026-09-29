import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { GET as getFile } from '@/app/api/markdown/[...path]/route'
import { GET as getLlms } from '@/app/llms.txt/route'
import { GET as getLlmsFull } from '@/app/llms-full.txt/route'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { JsonLd } from '@/components/seo/json-ld'
import { getCatalog } from '@/lib/catalog/catalog'
import { DEFINITIONS, MCP_PATH, SITE } from '@/lib/catalog/definitions'
import {
  loadCorpus,
  loadLlmsTags,
  loadSitemapEntries,
} from '@/lib/catalog/discovery'
import {
  filePathToRef,
  filePathToTagKey,
  isValidHandle,
  isValidKeyPart,
  isValidOwnedKey,
  isValidTagKey,
  parseRef,
  refToFilePath,
  refToPath,
  tagFilePath,
} from '@/lib/catalog/keys'
import { loadGuideSteps } from '@/lib/catalog/loaders'
import { GUIDES, guidePath } from '@/lib/constants/guides'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import {
  collectionJsonLd,
  companyJsonLd,
  guideJsonLd,
  toolJsonLd,
  websiteJsonLd,
  workflowJsonLd,
} from '@/lib/seo/structured-data'

/**
 * THE DISCOVERY SURFACE: what a crawler, an answer engine or an agent is told
 * about the catalog must be exactly what the build rendered — every page in
 * the sitemap, every file in `/llms.txt`, every file's content in
 * `/llms-full.txt`, one definition of each word, and structured data that
 * only restates facts already on the page.
 */

const FILE_LINE = /^- \[([^\]]+)\]\((https?:\/\/[^)]+\.md)\): (.+)$/
const ORIGIN = /^https?:\/\/[^/]+$/

type Graph = { '@graph': Array<Record<string, unknown>> }

describe('definitions', () => {
  test('one definition per word, each with a valid example key', () => {
    expect(DEFINITIONS.map((entry) => entry.term)).toEqual([
      'Company',
      'Tool',
      'Workflow',
      'Tag',
    ])
    const [company, tool, workflow, tag] = DEFINITIONS
    expect(isValidHandle(company?.example ?? '')).toBe(true)
    expect(isValidOwnedKey(tool?.example ?? '')).toBe(true)
    expect(isValidKeyPart(workflow?.example ?? '')).toBe(true)
    expect(isValidTagKey(tag?.example ?? '')).toBe(true)
    for (const entry of DEFINITIONS) {
      expect(entry.definition.endsWith('.')).toBe(true)
      expect(entry.path).toMatch(/\.(md|yml)$/)
    }
  })

  test('the site origin is absolute with no trailing slash', () => {
    expect(SITE_ORIGIN).toMatch(ORIGIN)
  })
})

describe('robots.txt', () => {
  const rulesOf = (result: ReturnType<typeof robots>) =>
    Array.isArray(result.rules) ? result.rules : [result.rules]

  test('allows every crawler, names the AI crawlers, points at the sitemap', () => {
    const result = robots()
    const rules = rulesOf(result)
    expect(rules[0]?.userAgent).toBe('*')
    const named = rules.flatMap((rule) =>
      Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent]
    )
    // Each answer engine's crawler, search indexer and user fetcher.
    for (const bot of [
      'GPTBot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'ClaudeBot',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User',
      'Google-Extended',
      'Applebot',
      'MistralAI-User',
    ]) {
      expect(named).toContain(bot)
    }
    expect(result.sitemap).toBe(`${SITE_ORIGIN}/sitemap.xml`)
    expect(result.host).toBe(SITE_ORIGIN)
  })

  test('every group keeps crawlers out of /api/ and off no page or file', async () => {
    const rules = rulesOf(robots())
    // A crawler obeys only the most specific group that names it, so a rule
    // written in `*` alone never reaches the named crawlers.
    for (const rule of rules) {
      expect(rule).toMatchObject({ allow: '/', disallow: '/api/' })
    }
    const blocked = rules.flatMap((rule) => [rule.disallow ?? []].flat())
    const open = [
      ...(await sitemap()).map((entry) => entry.url.slice(SITE_ORIGIN.length)),
      ...loadCorpus().map((entry) => entry.file),
      ...loadLlmsTags().map((entry) => entry.file),
      '/llms.txt',
      '/llms-full.txt',
      MCP_PATH,
    ]
    for (const path of open) {
      expect(
        blocked.some((prefix) => path.startsWith(prefix)),
        path
      ).toBe(false)
    }
  })
})

describe('sitemap.xml', () => {
  test('lists every indexable page once, most important first', async () => {
    const catalog = getCatalog()
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.slice(0, 4)).toEqual(
      ['/', '/tools', '/workflows', '/companies'].map(
        (path) => `${SITE_ORIGIN}${path}`
      )
    )
    for (const key of catalog.companies.keys()) {
      expect(urls).toContain(`${SITE_ORIGIN}/companies/${key}`)
    }
    for (const key of catalog.tools.keys()) {
      expect(urls).toContain(`${SITE_ORIGIN}/tools/${key}`)
    }
    for (const key of catalog.workflows.keys()) {
      expect(urls).toContain(`${SITE_ORIGIN}/workflows/${key}`)
    }
    // The home page, three listings and each guide.
    for (const guide of GUIDES) {
      expect(urls).toContain(`${SITE_ORIGIN}${guidePath(guide)}`)
    }
    expect(urls.length).toBe(
      4 +
        GUIDES.length +
        catalog.companies.size +
        catalog.tools.size +
        catalog.workflows.size
    )
    // No pinned or file URLs.
    expect(urls.some((url) => url.includes('@') || url.endsWith('.md'))).toBe(
      false
    )
  })

  test('every entity page carries its own last-modified date', async () => {
    const entries = loadSitemapEntries()
    const entity = entries.filter((entry) =>
      /^\/(tools|companies|workflows)\/./.test(entry.path)
    )
    expect(entity.length).toBeGreaterThan(0)
    for (const entry of entity) {
      expect(typeof entry.updatedAt).toBe('number')
      expect(entry.priority).toBeGreaterThan(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    }
    const rendered = await sitemap()
    for (const entry of rendered) {
      if (entry.lastModified) {
        expect(entry.lastModified).toBeInstanceOf(Date)
      }
    }
  })
})

describe('/llms.txt', () => {
  test('follows the llmstxt.org shape and links every file with a summary', async () => {
    const catalog = getCatalog()
    const text = await (await getLlms()).text()
    const lines = text.split('\n')
    expect(lines[0]).toBe(`# ${SITE.name}`)
    expect(lines[2]).toBe(`> ${SITE.tagline}`)
    for (const heading of [
      '## Workflows',
      '## Tools',
      '## Companies',
      '## Tags',
      '## Optional',
    ]) {
      expect(lines).toContain(heading)
    }
    // Nothing before the first H2 is a heading: the definitions are prose.
    const firstSection = lines.indexOf('## Workflows')
    // Workflows first: they are what an agent comes for.
    expect(firstSection).toBeLessThan(lines.indexOf('## Tools'))
    expect(
      lines.slice(1, firstSection).some((line) => line.startsWith('#'))
    ).toBe(false)
    for (const entry of DEFINITIONS) {
      expect(text).toContain(
        `**${entry.term}** (\`${entry.example}\`): ${entry.definition}`
      )
    }
    // Catalog files are on the site; the repository's own docs are not files it lists.
    const fileLines = lines.filter(
      (line) => FILE_LINE.test(line) && !line.includes(SITE.repository)
    )
    expect(fileLines.length).toBe(
      catalog.documents.size + catalog.tagDocuments.size
    )
    for (const line of fileLines) {
      const [, title, url, summary] = FILE_LINE.exec(line) ?? []
      expect(title?.trim().length).toBeGreaterThan(0)
      expect(summary?.trim().length).toBeGreaterThan(0)
      expect(url?.startsWith(`${SITE_ORIGIN}/`)).toBe(true)
      const path = (url ?? '').slice(SITE_ORIGIN.length)
      const tagKey = filePathToTagKey(path)
      if (tagKey) {
        expect(catalog.tagDocuments.has(tagKey), line).toBe(true)
        continue
      }
      const ref = filePathToRef(path)
      expect(ref, line).not.toBeNull()
      expect(catalog.documents.has(`${ref?.type}:${ref?.key}`), line).toBe(true)
    }
    expect(text).toContain(`(${SITE_ORIGIN}/llms-full.txt)`)
    expect(text).toContain(`(${SITE_ORIGIN}/sitemap.xml)`)
    expect(text).toContain(`${SITE.repository}/blob/main/CONTRIBUTING.md`)
    expect(text).not.toContain('localhost:3000/undefined')
  })
})

describe('/llms-full.txt', () => {
  test('carries every rendered file, each introduced by its URL', async () => {
    const catalog = getCatalog()
    const text = await (await getLlmsFull()).text()
    expect(text.startsWith(`# ${SITE.name} — every file\n`)).toBe(true)
    expect(text).toContain(`Files: ${catalog.documents.size}.`)
    const markers = text.match(/^<!-- file: (\S+) -->$/gm) ?? []
    expect(markers.length).toBe(catalog.documents.size)
    for (const document of catalog.documents.values()) {
      expect(text).toContain(document.markdown.trimEnd())
    }
    // Workflows first, then tools, then companies — the order /llms.txt uses.
    const firstWorkflow = text.indexOf(`<!-- file: ${SITE_ORIGIN}/workflows/`)
    const firstCompany = text.indexOf(`<!-- file: ${SITE_ORIGIN}/companies/`)
    const firstTool = text.indexOf(`<!-- file: ${SITE_ORIGIN}/tools/`)
    expect(firstWorkflow).toBeLessThan(firstTool)
    expect(firstTool).toBeLessThan(firstCompany)
  })
})

describe('page metadata', () => {
  test('a file page declares its canonical URL and its markdown alternate', () => {
    const metadata = pageMetadata({
      title: 'Enrich contacts by Clay',
      description: 'Enrich a contact.',
      path: '/tools/clay/enrich-contacts',
      file: '/tools/clay/enrich-contacts.md',
    })
    expect(metadata.alternates).toEqual({
      canonical: '/tools/clay/enrich-contacts',
      types: { 'text/markdown': '/tools/clay/enrich-contacts.md' },
    })
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      url: '/tools/clay/enrich-contacts',
      title: 'Enrich contacts by Clay',
    })
    expect(metadata.robots).toBeUndefined()
  })

  test('a listing has a canonical URL and no alternate', () => {
    expect(
      pageMetadata({ title: 'Tools', description: 'd', path: '/tools' })
        .alternates
    ).toEqual({ canonical: '/tools' })
  })

  test('every page restates the site name and locale: its Open Graph replaces the layout’s', () => {
    for (const metadata of [
      pageMetadata({ title: 'Tools', description: 'd', path: '/tools' }),
      pageMetadata({
        title: 'Enrich contacts by Clay',
        description: 'd',
        path: '/tools/clay/enrich-contacts',
        file: '/tools/clay/enrich-contacts.md',
      }),
    ]) {
      expect(metadata.openGraph).toMatchObject({
        siteName: SITE.name,
        locale: 'en_US',
      })
    }
  })
})

describe('the .md files', () => {
  const catalog = getCatalog()
  const fetchFile = (path: string) =>
    getFile(new Request(`${SITE_ORIGIN}${path}`), {
      params: Promise.resolve({ path: path.slice(1).split('/') }),
    })

  test('a company, tool or workflow file names its page as the canonical URL', async () => {
    const refs = [...catalog.documents.keys()].map((key) => {
      const ref = parseRef(key)
      if (!ref) {
        throw new Error(`not a ref: ${key}`)
      }
      return ref
    })
    expect(refs.length).toBeGreaterThan(0)
    const files = await Promise.all(
      refs.map(async (ref) => ({
        page: refToPath(ref),
        response: await fetchFile(refToFilePath(ref)),
      }))
    )
    for (const { page, response } of files) {
      expect(response.status, page).toBe(200)
      expect(response.headers.get('Content-Type')).toBe(
        'text/markdown; charset=utf-8'
      )
      expect(response.headers.get('Link'), page).toBe(
        `<${SITE_ORIGIN}${page}>; rel="canonical"`
      )
    }
  })

  test('a tag file has no page, so it names no canonical URL', async () => {
    const [key] = catalog.tagDocuments.keys()
    if (!key) {
      throw new Error('no tag files in the tree')
    }
    const response = await fetchFile(tagFilePath(key))
    expect(response.status).toBe(200)
    expect(response.headers.get('Link')).toBeNull()
  })
})

describe('structured data', () => {
  const catalog = getCatalog()
  const origin = 'https://example.test'

  test('the site is a WebSite with a publisher and a search action', () => {
    const graph = (websiteJsonLd(origin) as Graph)['@graph']
    expect(graph.map((node) => node['@type'])).toEqual([
      'WebSite',
      'Organization',
    ])
    expect(graph[0]?.url).toBe(origin)
    // The publisher's own profiles, the ones the footer links to.
    expect(graph[1]?.sameAs).toEqual(
      expect.arrayContaining(
        SITE.publisher.profiles.map((profile) => profile.url)
      )
    )
  })

  test('a tool is a SoftwareApplication with its file as an alternate encoding', () => {
    const [key] = catalog.order.toolsNew
    const tool = key ? catalog.tools.get(key) : undefined
    const company = tool ? catalog.companies.get(tool.companyKey) : undefined
    if (!(tool && company)) {
      throw new Error('the seed tool is missing')
    }
    const graph = (toolJsonLd(origin, tool, company, tool.updatedAt) as Graph)[
      '@graph'
    ]
    expect(graph.map((node) => node['@type'])).toEqual([
      'SoftwareApplication',
      'WebPage',
      'BreadcrumbList',
    ])
    expect(graph[0]?.name).toBe(`${tool.name} (${company.name})`)
    expect(graph[0]?.description).toBe(tool.summary)
    expect(graph[1]?.encoding).toEqual({
      '@type': 'MediaObject',
      encodingFormat: 'text/markdown',
      contentUrl: `${origin}/tools/${tool.key}.md`,
    })
    const crumbs = graph[2]?.itemListElement as Array<{ item: string }>
    expect(crumbs.map((crumb) => crumb.item)).toEqual([
      `${origin}/tools`,
      `${origin}/companies/${company.key}`,
      `${origin}/tools/${tool.key}`,
    ])
  })

  test('a workflow is a HowTo: one step per step, one tool per tool, a person as author', () => {
    const workflow = [...catalog.workflows.values()].find(
      (candidate) => candidate.steps.length > 1
    )
    if (!workflow) {
      throw new Error('no multi-step workflow in the tree')
    }
    const tools = workflow.toolKeys.flatMap((key) => {
      const tool = catalog.tools.get(key)
      const company = tool ? catalog.companies.get(tool.companyKey) : undefined
      return tool && company ? [{ tool, company }] : []
    })
    const graph = (
      workflowJsonLd(origin, workflow, tools, workflow.updatedAt) as Graph
    )['@graph']
    const howTo = graph[0] as {
      '@type': string
      step: Array<{ position: number; name: string; text: string }>
      tool: Array<{ name: string; url: string }>
      author: { '@type': string; url: string }
    }
    expect(howTo['@type']).toBe('HowTo')
    expect(howTo.step.length).toBe(workflow.steps.length)
    expect(howTo.step.map((step) => step.position)).toEqual(
      workflow.steps.map((_, index) => index + 1)
    )
    expect(howTo.tool.length).toBe(workflow.toolKeys.length)
    expect(
      howTo.tool.every((tool) => tool.url.startsWith(`${origin}/tools/`))
    ).toBe(true)
    expect(howTo.author).toMatchObject({
      '@type': 'Person',
      url: `https://github.com/${workflow.author}`,
    })
  })

  test('a company is an Organization; a listing is a CollectionPage with an ItemList', () => {
    const company = catalog.companies.get('clay')
    if (!company) {
      throw new Error('the seed company is missing')
    }
    const graph = (companyJsonLd(origin, company, company.updatedAt) as Graph)[
      '@graph'
    ]
    expect(graph[0]).toMatchObject({
      '@type': 'Organization',
      name: company.name,
      // The CDN URL as is: never the site's origin glued in front of it.
      logo: company.logo?.url,
    })
    expect(company.logo?.url).toMatch(
      /^https:\/\/cdn\.growth\.engineer\/icons\/companies\/clay-/
    )
    const collection = collectionJsonLd(
      origin,
      { path: '/tools', name: 'Tools', description: 'd' },
      [{ name: 'A', path: '/tools/a/b' }]
    ) as { mainEntity: { numberOfItems: number } }
    expect(collection.mainEntity.numberOfItems).toBe(1)
  })

  test('a contribute guide is a HowTo whose steps link to the steps on its page', () => {
    for (const guide of GUIDES) {
      const steps = loadGuideSteps(guide.id)
      expect(steps.length, guide.id).toBeGreaterThan(0)
      const page = `${origin}${guidePath(guide)}`
      const graph = (guideJsonLd(origin, guide, steps) as Graph)['@graph']
      expect(graph.map((node) => node['@type'])).toEqual([
        'HowTo',
        'WebPage',
        'BreadcrumbList',
      ])
      const howTo = graph[0] as {
        name: string
        step: Array<{ position: number; name: string; url: string }>
      }
      expect(howTo.name).toBe(guide.title)
      expect(howTo.step.map((step) => step.name)).toEqual(
        steps.map((step) => step.title)
      )
      // The page draws each step with its key as the id (GuideSteps).
      expect(howTo.step.map((step) => step.url)).toEqual(
        steps.map((step) => `${page}#${step.key}`)
      )
      const crumbs = graph[2]?.itemListElement as Array<{ item: string }>
      expect(crumbs.map((crumb) => crumb.item)).toEqual([`${origin}/`, page])
    }
  })

  test('JSON-LD can never close its own script tag', () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ name: '</script><script>alert(1)</script>' }} />
    )
    expect(html).not.toContain('</script><script>')
    expect(html).toContain('\\u003c/script>')
    expect(html.startsWith('<script type="application/ld+json">')).toBe(true)
  })
})
