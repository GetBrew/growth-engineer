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
import { relationsOf } from './relations'

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

/** Every indexable page, most important first, dated like its file. */
export async function loadSitemapEntries(): Promise<Array<SitemapEntry>> {
  const catalog = getCatalog()
  // A page's date is its file's: the newest of everything the file shows.
  const dated = (type: EntityType, keys: Iterable<string>) =>
    [...keys].map((key) => ({
      path: refToPath({ type, key }),
      updatedAt: catalog.documents.get(formatRef(type, key))?.updatedAt,
    }))
  const workflows = dated('workflow', catalog.workflows.keys())
  const tools = dated('tool', catalog.tools.keys())
  const companies = dated('company', catalog.companies.keys())
  const newestOf = (entries: ReadonlyArray<{ updatedAt?: number }>) =>
    newest(
      entries.flatMap((entry) =>
        entry.updatedAt === undefined ? [] : [entry.updatedAt]
      )
    )
  const kinds = {
    companies: newestOf(companies),
    tools: newestOf(tools),
    workflows: newestOf(workflows),
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
    // How to contribute: no entity date behind them, so no lastmod.
    { path: '/contribute', changeFrequency: 'monthly', priority: 0.5 },
    ...GUIDES.map((guide) => ({
      path: `/contribute/${guide.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    ...workflows.map((entry) => ({
      ...entry,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...tools.map((entry) => ({
      ...entry,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...companies.map((entry) => ({
      ...entry,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

/** One line of `/llms.txt`: a file, named and summarized. */
export type LlmsEntry = {
  title: string
  /** `/tools/apollo/enrich-person` */
  path: string
  /** `/tools/apollo/enrich-person.md` */
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
      const ref = { type: 'tool' as const, key: tool.key }
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
      }
      const toolCount = relationsOf(catalog, formatRef('company', company.key))
        .tools.length
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
