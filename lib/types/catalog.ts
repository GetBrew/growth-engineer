import type { EntityType, TagNamespace } from '@/lib/catalog/keys'

/**
 * The catalog's types: what a markdown source file becomes once the build has
 * parsed it, resolved its references and derived the projections. Plain data,
 * no ids — the public `key` IS the identity (docs/data-model.md).
 *
 * PURE MODULE: types only. Imported by the renderer, the pages and the
 * client components alike.
 */

/* ────────────────────────────────── access ──────────────────────────────── */

export type AccessType = 'mcp' | 'cli' | 'api'

/**
 * How a way in authenticates. An API key always names the environment
 * variable it lives in, so a file can say where to put it without ever
 * holding it; `header` is for an API only.
 */
export type Auth =
  | { method: 'none' }
  | { method: 'oauth' }
  | { method: 'api_key'; envVar: string; header?: string; keyUrl?: string }

type AccessCommon = {
  /** Derived: a way with no `maintainer` is the vendor's own. */
  official: boolean
  /** Who runs a community way. */
  maintainer?: string
  /** THE OPERATION: MCP tool name, CLI command or API endpoint. */
  operation: string
  auth: Auth
  docsUrl?: string
}

export type Access =
  | (AccessCommon & {
      type: 'mcp'
      transport: 'remote' | 'local'
      url?: string
      command?: string
    })
  | (AccessCommon & {
      type: 'cli'
      installCommand: string
      binary: string
    })
  | (AccessCommon & { type: 'api'; baseUrl: string })

/* ─────────────────────────────────── entities ───────────────────────────── */

/** Deprecated stays visible with a warning; a draft has no page and no file. */
type Status = 'published' | 'deprecated'

export type Company = {
  key: string
  name: string
  domain: string
  /** The `category:*` tag slug the directory groups by. */
  category: string
  tagline?: string
  description?: string
  logo?: { url: string }
  links: {
    /** `https://<domain>`. */
    website: string
    docs?: string
    github?: string
  }
  status: Status
  /** From the file's `updated` date, at UTC midnight. */
  updatedAt: number
  aliases: ReadonlyArray<string>
  /** Computed: its category, plus the ways in and capabilities of its published tools. */
  tags: ReadonlyArray<string>
  searchText: string
}

export type Tool = {
  key: string
  companyKey: string
  name: string
  summary: string
  /** A `capability:` slug from tags.yml; the key names the function. */
  capability: string
  /** The page that documents the call. */
  docs?: string
  access: ReadonlyArray<Access>
  /** Computed: its capability, its company's category, one `has:<type>` per way in. */
  tags: ReadonlyArray<string>
  status: Status
  updatedAt: number
  aliases: ReadonlyArray<string>
  searchText: string
}

type WorkflowInput = {
  name: string
  description: string
  example?: string
}

export type WorkflowStep = {
  /** Slug of the title: "find-contacts". */
  key: string
  title: string
  toolKey: string
  instruction: string
}

export type Workflow = {
  /** The file name under workflows/: `intent-to-meeting`. */
  key: string
  /** The GitHub login of whoever wrote it. Workflows are by people. */
  author: string
  title: string
  summary: string
  /** Computed: its motion and channel tags, its tools' capabilities, and the `has:*` every tool shares. */
  tags: ReadonlyArray<string>
  inputs: ReadonlyArray<WorkflowInput>
  steps: ReadonlyArray<WorkflowStep>
  doneWhen: ReadonlyArray<string>
  notes?: string
  /** Editorial rank on the featured list; absent = not featured. */
  featured?: number
  /** Distinct tool keys in first-use order across the steps. */
  toolKeys: ReadonlyArray<string>
  toolCount: number
  status: Status
  updatedAt: number
  aliases: ReadonlyArray<string>
  searchText: string
}

export type Tag = {
  /** `capability:enrich-contacts` */
  key: string
  namespace: TagNamespace
  slug: string
  label: string
  synonyms: ReadonlyArray<string>
  /** Published companies, tools and workflows carrying it. */
  counts: { companies: number; tools: number; workflows: number }
}

/**
 * What one entry is linked to, by key: the companies, tools and workflows one
 * edge away, and its tags. Published entries only, except the ones an entry
 * names itself (a workflow's tools, a tool's company).
 */
export type Relations = {
  companies: ReadonlyArray<string>
  tools: ReadonlyArray<string>
  workflows: ReadonlyArray<string>
  tags: ReadonlyArray<string>
}

/** A tag as a filter chip: what a listing needs to draw and count it. */
export type TagChip = {
  key: string
  namespace: TagNamespace
  slug: string
  label: string
  counts: Tag['counts']
}

/** One rendered file: what `.md` URLs, the Copy button and `/llms.txt` serve. */
export type CatalogDocument = {
  /** `tool:apollo/enrich-person` */
  ref: string
  entityType: EntityType
  markdown: string
  lineCount: number
  updatedAt: number
}

/** A tag's rendered file, `/tags/<namespace>/<slug>.md`: everything carrying it. */
export type TagDocument = {
  /** `capability:enrich-contacts` */
  key: string
  markdown: string
  lineCount: number
  updatedAt: number
}

/* ──────────────────────────────── list shapes ───────────────────────────── */

export type Category = { slug: string; label: string }

/** What a list row needs from a tool and the company that makes it. */
export type ToolListItem = {
  tool: {
    key: string
    name: string
    summary: string
    access: ReadonlyArray<AccessType>
  }
  company: { key: string; name: string; logoUrl?: string }
  category?: Category
}

/** What the directory needs from a company. */
export type CompanyListItem = {
  company: {
    key: string
    name: string
    tagline?: string
    description?: string
    logoUrl?: string
  }
  category?: Category
}

/** What a list row needs from a workflow: the workflow plus its tools' companies. */
export type WorkflowListItem = {
  workflow: {
    key: string
    title: string
    author: string
    summary?: string
  }
  tools: ReadonlyArray<{
    companyKey: string
    companyName: string
    logoUrl?: string
  }>
}

/* ────────────────────────────── the palette ─────────────────────────────── */

/**
 * One catalog row flattened for the ⌘K palette: the least a result needs to
 * be drawn and followed. The palette ships EVERY row into the layout, so this
 * carries no access lists, no tags and no logo — the detail pages own those.
 */
export type PaletteItem = {
  kind: EntityType
  /** The catalog key; unique within a kind, so `kind:key` is the react key. */
  key: string
  title: string
  /** The one line under the title: a tagline, summary or company name. */
  subtitle: string
  href: string
  /** Lowercased haystack; `searchPaletteItems` matches token prefixes in it. */
  searchText: string
  updatedAt: number
}
