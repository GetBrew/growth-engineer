import 'server-only'

import { GUIDES } from '@/lib/constants/guides'
import type { CatalogDocument } from '@/lib/types/catalog'
import { getCatalog } from './catalog'
import {
  type EntityType,
  formatRef,
  parseRef,
  refToFilePath,
  refToPath,
} from './keys'

/**
 * What the discovery surfaces read: the sitemap, `/llms.txt` and
 * `/llms-full.txt`. The same catalog the pages use, projected into "every
 * page" and "every file, with a name and a summary" — so what a crawler is
 * told exists is exactly what the build rendered.
 */

export type SitemapEntry = {
  path: string
  /** From the entity's `updated` date; listings carry the newest of their kind. */
  updatedAt?: number
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
}

function newest(dates: ReadonlyArray<number>): number | undefined {
  return dates.length > 0 ? Math.max(...dates) : undefined
}

/**
 * Every indexable page, most important first. Map focus pages are `noindex`
 * (one thin page per node, for navigation) and stay out on purpose.
 */
export async function loadSitemapEntries(): Promise<Array<SitemapEntry>> {
  const catalog = getCatalog()
  const companies = [...catalog.companies.values()]
  const tools = [...catalog.tools.values()]
  const workflows = [...catalog.workflows.values()]
  const kinds = {
    companies: newest(companies.map((company) => company.updatedAt)),
    tools: newest(tools.map((tool) => tool.updatedAt)),
    workflows: newest(workflows.map((workflow) => workflow.updatedAt)),
  }
  const everything = newest(
    Object.values(kinds).filter((date): date is number => date !== undefined)
  )
  return [
    { path: '/', updatedAt: everything, changeFrequency: 'daily', priority: 1 },
    {
      path: '/tools',
      updatedAt: kinds.tools,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      path: '/workflows',
      updatedAt: kinds.workflows,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      path: '/companies',
      updatedAt: kinds.companies,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      path: '/map',
      updatedAt: everything,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // How to contribute: no entity date behind them, so no lastmod.
    { path: '/contribute', changeFrequency: 'monthly', priority: 0.5 },
    ...GUIDES.map((guide) => ({
      path: `/contribute/${guide.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    ...workflows.map((workflow) => ({
      path: refToPath({
        type: 'workflow' as const,
        key: workflow.key,
        version: undefined,
      }),
      updatedAt: workflow.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...tools.map((tool) => ({
      path: refToPath({
        type: 'tool' as const,
        key: tool.key,
        version: undefined,
      }),
      updatedAt: tool.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...companies.map((company) => ({
      path: refToPath({
        type: 'company' as const,
        key: company.key,
        version: undefined,
      }),
      updatedAt: company.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

/** One line of `/llms.txt`: a file, named and summarized. */
export type LlmsEntry = {
  title: string
  /** `/tools/clay/enrich-contacts` */
  path: string
  /** `/tools/clay/enrich-contacts.md` */
  file: string
  summary: string
}

const FIRST_SENTENCE = /^[^.!?]+[.!?]/

function firstSentence(text: string): string {
  const match = FIRST_SENTENCE.exec(text.trim())
  return (match ? match[0] : text).trim()
}

/** Every file in key order, with a title and a one-line summary. */
export async function loadLlmsIndex(): Promise<
  Record<EntityType, Array<LlmsEntry>>
> {
  const catalog = getCatalog()
  const byKey = (a: { key: string }, b: { key: string }) =>
    a.key.localeCompare(b.key)
  return {
    tool: [...catalog.tools.values()].sort(byKey).map((tool) => {
      const ref = { type: 'tool' as const, key: tool.key, version: undefined }
      const company = catalog.companies.get(tool.companyKey)
      return {
        title: company ? `${tool.name} (${company.name})` : tool.name,
        path: refToPath(ref),
        file: refToFilePath(ref),
        summary: tool.summary,
      }
    }),
    workflow: [...catalog.workflows.values()].sort(byKey).map((workflow) => {
      const ref = {
        type: 'workflow' as const,
        key: workflow.key,
        version: undefined,
      }
      return {
        title: workflow.title,
        path: refToPath(ref),
        file: refToFilePath(ref),
        summary: `${workflow.summary} By @${workflow.author}, ${workflow.toolCount} ${workflow.toolCount === 1 ? 'tool' : 'tools'}.`,
      }
    }),
    company: [...catalog.companies.values()].sort(byKey).map((company) => {
      const ref = {
        type: 'company' as const,
        key: company.key,
        version: undefined,
      }
      const toolCount = (catalog.toolsByCompany.get(company.key) ?? []).length
      const summary =
        company.tagline ??
        (company.description
          ? firstSentence(company.description)
          : undefined) ??
        `${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}.`
      return {
        title: company.name,
        path: refToPath(ref),
        file: refToFilePath(ref),
        summary,
      }
    }),
  }
}

/** Every rendered file, in the order `/llms.txt` lists them. */
export async function loadCorpus(): Promise<
  Array<{ file: string; document: CatalogDocument }>
> {
  const catalog = getCatalog()
  const byKey = (a: string, b: string) => a.localeCompare(b)
  const refs = [
    ...[...catalog.tools.keys()]
      .sort(byKey)
      .map((key) => formatRef('tool', key)),
    ...[...catalog.workflows.keys()]
      .sort(byKey)
      .map((key) => formatRef('workflow', key)),
    ...[...catalog.companies.keys()]
      .sort(byKey)
      .map((key) => formatRef('company', key)),
  ]
  return refs.flatMap((ref) => {
    const document = catalog.documents.get(ref)
    const parsed = parseRef(ref)
    return document && parsed ? [{ file: refToFilePath(parsed), document }] : []
  })
}
