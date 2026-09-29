import { isValidHandle } from '@/lib/catalog/keys'
import {
  type CompanyFrontmatter,
  type CompanyWays,
  companySchema,
} from '@/lib/schemas/content'
import type { Company, Tag } from '@/lib/types/catalog'
import { dateToMs } from './derive'
import type { ProblemList } from './errors'
import { type LogoExtension, parseLogoUrl } from './logos'
import { parseFile } from './parse-file'
import { proseProblems } from './prose'
import type { ContentFile } from './read-tree'

/**
 * Companies: one file each, `companies/<handle>/company.md`, holding who
 * they are and how an agent reaches them — at most one MCP server, one CLI
 * and one API in the header. The tools resolve their calls against those
 * ways (./build-tools.ts); a company's tags and search text wait for its
 * tools (build-catalog.ts).
 */

type CompanyFile = ContentFile & { kind: 'company' }

function toCompany(
  file: CompanyFile,
  parsed: { data: CompanyFrontmatter; body: string }
): Company {
  const { data, body } = parsed
  return {
    key: file.handle,
    name: data.name,
    domain: data.domain,
    category: data.category,
    ...(data.tagline ? { tagline: data.tagline } : {}),
    ...(body ? { description: body } : {}),
    // Until a maintainer uploads a new company's logo, the site draws the
    // name's first letter.
    ...(data.logo ? { logo: { url: data.logo } } : {}),
    links: {
      website: `https://${data.domain}`,
      ...(data.docs ? { docs: data.docs } : {}),
      ...(data.github ? { github: data.github } : {}),
    },
    status: data.status,
    updatedAt: dateToMs(data.updated),
    aliases: data.aliases,
    tags: [],
    searchText: '',
  }
}

/**
 * Every company has a logo: its CDN URL, or a file beside company.md that a
 * maintainer has yet to upload. A URL names the company it belongs to.
 */
function logoProblemOf(
  handle: string,
  logo: string | undefined,
  isPending: boolean
): string | undefined {
  const owner = logo ? parseLogoUrl(logo)?.handle : undefined
  if (owner && owner !== handle) {
    return `logo: the URL is the logo of "${owner}", not "${handle}"`
  }
  if (!(logo || isPending)) {
    return 'no logo: add the image beside company.md as logo.svg (or .png, .jpg, .webp), and a maintainer puts it on the CDN'
  }
}

export function buildCompanies(
  files: ReadonlyArray<ContentFile>,
  tags: ReadonlyMap<string, Tag>,
  pendingLogos: ReadonlyMap<string, LogoExtension>,
  problems: ProblemList
): { companies: Map<string, Company>; ways: Map<string, CompanyWays> } {
  const companies = new Map<string, Company>()
  const ways = new Map<string, CompanyWays>()
  for (const file of files) {
    if (file.kind !== 'company') {
      continue
    }
    if (!isValidHandle(file.handle)) {
      problems.add(
        file.path,
        `"${file.handle}" is not a usable handle: lowercase letters, digits and hyphens, and not a reserved word`
      )
      continue
    }
    const parsed = parseFile(file, companySchema, problems)
    if (!parsed) {
      continue
    }
    if (!tags.has(`category:${parsed.data.category}`)) {
      problems.add(
        file.path,
        `category "${parsed.data.category}" is not in tags.yml`
      )
    }
    for (const problem of proseProblems(
      parsed.body,
      parsed.bodyLine,
      'the description'
    )) {
      problems.add(file.path, problem.message, problem.line)
    }
    const logoProblem = logoProblemOf(
      file.handle,
      parsed.data.logo,
      pendingLogos.has(file.handle)
    )
    if (logoProblem) {
      problems.add(file.path, logoProblem)
    }
    companies.set(file.handle, toCompany(file, parsed))
    const { mcp, cli, api } = parsed.data
    ways.set(file.handle, {
      ...(mcp ? { mcp } : {}),
      ...(cli ? { cli } : {}),
      ...(api ? { api } : {}),
    })
  }
  return { companies, ways }
}
