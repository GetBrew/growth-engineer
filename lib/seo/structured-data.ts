import { SITE } from '@/lib/catalog/definitions'
import { refToFilePath, refToPath } from '@/lib/catalog/keys'
import { toolDocsUrl } from '@/lib/catalog/tool-docs'
import type {
  Company,
  CompanyListItem,
  Tool,
  ToolListItem,
  Workflow,
  WorkflowListItem,
} from '@/lib/types/catalog'

/**
 * Structured data (schema.org JSON-LD) for the pages that describe one
 * thing: what search engines and answer engines read to know that a page is
 * a company, a callable tool, or a step-by-step workflow — with the facts
 * already on the page, never new ones. PURE: builders only; `JsonLd` in
 * components/seo renders them.
 */

type JsonLd = Record<string, unknown>

const CONTEXT = 'https://schema.org'

function absolute(origin: string, path: string): string {
  return `${origin}${path}`
}

/** The site and its publisher, on every page. */
export function websiteJsonLd(origin: string): JsonLd {
  return {
    '@context': CONTEXT,
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: SITE.name,
        description: SITE.tagline,
        publisher: { '@id': `${origin}/#publisher` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${origin}/tools?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${origin}/#publisher`,
        name: SITE.publisher.name,
        url: SITE.publisher.url,
        logo: absolute(origin, '/logos/brew.svg'),
        sameAs: [SITE.repository],
      },
    ],
  }
}

function breadcrumb(
  origin: string,
  trail: ReadonlyArray<{ name: string; path: string }>
): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(origin, crumb.path),
    })),
  }
}

/** `updatedAt` is the company file's date: its own and its tools', newest. */
export function companyJsonLd(
  origin: string,
  company: Company,
  updatedAt: number
): JsonLd {
  const path = refToPath({
    type: 'company',
    key: company.key,
  })
  return {
    '@context': CONTEXT,
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}${path}#organization`,
        name: company.name,
        url: company.links.website,
        ...(company.logo ? { logo: absolute(origin, company.logo.url) } : {}),
        ...(company.description || company.tagline
          ? { description: company.description ?? company.tagline }
          : {}),
        ...(company.links.github ? { sameAs: [company.links.github] } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': absolute(origin, path),
        url: absolute(origin, path),
        name: company.name,
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${origin}${path}#organization` },
        dateModified: new Date(updatedAt).toISOString(),
      },
      breadcrumb(origin, [
        { name: 'Companies', path: '/companies' },
        { name: company.name, path },
      ]),
    ],
  }
}

/**
 * A tool is one callable function of a product, reachable over MCP, CLI or
 * API — `SoftwareApplication` with the ways in listed as its access URLs.
 */
export function toolJsonLd(
  origin: string,
  tool: Tool,
  company: Company,
  updatedAt: number
): JsonLd {
  const ref = { type: 'tool' as const, key: tool.key }
  const path = refToPath(ref)
  const docsUrl = toolDocsUrl(tool)
  // A URL that differs per account (`https://{subdomain}…`) is no address
  // to give; a CLI has none.
  const installUrls = tool.access
    .flatMap((entry) => {
      if (entry.type === 'api') {
        return [entry.baseUrl]
      }
      return entry.type === 'mcp' && entry.url ? [entry.url] : []
    })
    .filter((url) => !url.includes('{'))
  return {
    '@context': CONTEXT,
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}${path}#tool`,
        name: `${tool.name} (${company.name})`,
        description: tool.summary,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        provider: {
          '@type': 'Organization',
          name: company.name,
          url: company.links.website,
        },
        // Every way in: where an agent reaches the function.
        ...(installUrls.length > 0 ? { installUrl: installUrls } : {}),
        ...(docsUrl
          ? { softwareHelp: { '@type': 'CreativeWork', url: docsUrl } }
          : {}),
        keywords: tool.tags.join(', '),
        dateModified: new Date(updatedAt).toISOString(),
      },
      {
        '@type': 'WebPage',
        '@id': absolute(origin, path),
        url: absolute(origin, path),
        name: `${tool.name} by ${company.name}`,
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${origin}${path}#tool` },
        // The file an agent runs, as an alternate representation of the page.
        encoding: {
          '@type': 'MediaObject',
          encodingFormat: 'text/markdown',
          contentUrl: absolute(origin, refToFilePath(ref)),
        },
      },
      breadcrumb(origin, [
        { name: 'Tools', path: '/tools' },
        { name: company.name, path: `/companies/${company.key}` },
        { name: tool.name, path },
      ]),
    ],
  }
}

/** A workflow is a HowTo: ordered steps, each with the tool it uses. */
export function workflowJsonLd(
  origin: string,
  workflow: Workflow,
  tools: ReadonlyArray<{ tool: Tool; company: Company }>,
  updatedAt: number
): JsonLd {
  const ref = {
    type: 'workflow' as const,
    key: workflow.key,
  }
  const path = refToPath(ref)
  const toolNames = new Map(
    tools.map(({ tool, company }) => [
      tool.key,
      `${tool.name} (${company.name})`,
    ])
  )
  return {
    '@context': CONTEXT,
    '@graph': [
      {
        '@type': 'HowTo',
        '@id': `${origin}${path}#howto`,
        name: workflow.title,
        description: workflow.summary,
        author: {
          '@type': 'Person',
          name: `@${workflow.author}`,
          url: `https://github.com/${workflow.author}`,
        },
        tool: workflow.toolKeys.map((key) => ({
          '@type': 'HowToTool',
          name: toolNames.get(key) ?? key,
          url: absolute(origin, `/tools/${key}`),
        })),
        step: workflow.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.instruction,
          url: `${absolute(origin, path)}#step-${index + 1}`,
        })),
        keywords: workflow.tags.join(', '),
        dateModified: new Date(updatedAt).toISOString(),
      },
      {
        '@type': 'WebPage',
        '@id': absolute(origin, path),
        url: absolute(origin, path),
        name: workflow.title,
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${origin}${path}#howto` },
        encoding: {
          '@type': 'MediaObject',
          encodingFormat: 'text/markdown',
          contentUrl: absolute(origin, refToFilePath(ref)),
        },
      },
      breadcrumb(origin, [
        { name: 'Workflows', path: '/workflows' },
        { name: workflow.title, path },
      ]),
    ],
  }
}

/** A listing: the page plus an ordered list of everything on it. */
export function collectionJsonLd(
  origin: string,
  page: { path: string; name: string; description: string },
  items: ReadonlyArray<{ name: string; path: string }>
): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    '@id': absolute(origin, page.path),
    url: absolute(origin, page.path),
    name: page.name,
    description: page.description,
    isPartOf: { '@id': `${origin}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absolute(origin, item.path),
      })),
    },
  }
}

/** The names and paths a listing's structured data lists. */
export function listingItems(
  items:
    | ReadonlyArray<ToolListItem>
    | ReadonlyArray<CompanyListItem>
    | ReadonlyArray<WorkflowListItem>
): Array<{ name: string; path: string }> {
  return items.map((item) => {
    if ('tool' in item) {
      return { name: item.tool.name, path: `/tools/${item.tool.key}` }
    }
    if ('workflow' in item) {
      return {
        name: item.workflow.title,
        path: `/workflows/${item.workflow.key}`,
      }
    }
    return { name: item.company.name, path: `/companies/${item.company.key}` }
  })
}
