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

export type Auth = {
  method: 'none' | 'api_key' | 'oauth'
  /** "CLAY_API_KEY": named in the markdown file, never its value. */
  envVar?: string
  /** "Authorization: Bearer", "X-Api-Key"; absent = "Authorization: Bearer". */
  header?: string
  /** Where the user gets a key. */
  keyUrl?: string
  /** false = needs a sales call or approval. */
  selfServe: boolean
}

type AccessHealth = {
  ok: boolean
  checkedAt: number
  failingSince?: number
}

type AccessCommon = {
  /** false = community-maintained. */
  official: boolean
  /** Handle or name when not official. */
  maintainer?: string
  /** THE OPERATION: MCP tool name, CLI subcommand or API endpoint. */
  operation: string
  auth: Auth
  docsUrl?: string
  health?: AccessHealth
}

export type Access =
  | (AccessCommon & {
      type: 'mcp'
      transport: 'remote' | 'local'
      url?: string
      command?: string
      repoUrl?: string
    })
  | (AccessCommon & {
      type: 'cli'
      installCommand: string
      binary: string
      repoUrl?: string
    })
  | (AccessCommon & { type: 'api'; baseUrl: string; openApiUrl?: string })

/* ─────────────────────────────────── entities ───────────────────────────── */

/** Deprecated stays visible with a warning; a draft has no page and no file. */
type Status = 'published' | 'deprecated'

export type Company = {
  key: string
  name: string
  kind: 'vendor' | 'open_source' | 'individual'
  domain: string
  /** The `category:*` tag slug the directory groups by. */
  category: string
  tagline?: string
  description?: string
  logo?: { url: string }
  links: {
    website?: string
    docs?: string
    github?: string
    linkedin?: string
    x?: string
  }
  founded?: number
  headquarters?: string
  status: Status
  /** From the file's `updated` date, at UTC midnight. */
  updatedAt: number
  aliases: ReadonlyArray<string>
  searchText: string
}

export type Tool = {
  key: string
  companyKey: string
  name: string
  summary: string
  description?: string
  /** The capability slug — the second half of the key. */
  capability: string
  access: ReadonlyArray<Access>
  /** Derived tag keys: one `has:<type>` per way in. */
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
  /** Preferred way in; absent = the best available. */
  via?: AccessType
  instruction: string
}

export type Workflow = {
  /** The file name under workflows/: `intent-to-meeting`. */
  key: string
  /** The GitHub login of whoever wrote it. Workflows are by people. */
  author: string
  title: string
  summary: string
  /** Curated tag keys: `motion:outbound`, `channel:email`, `capability:*`. */
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
  description: string
  /** `has:*` is computed from tools, never authored. */
  derived: boolean
  counts: { companies: number; tools: number; workflows: number }
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
  /** `tool:clay/enrich-contacts` */
  ref: string
  entityType: EntityType
  markdown: string
  hash: string
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

/** What the directory needs from a company: the summary plus its ways in. */
export type CompanyListItem = {
  company: {
    key: string
    name: string
    tagline?: string
    description?: string
    domain?: string
    logoUrl?: string
  }
  category?: Category
  access: ReadonlyArray<AccessType>
}

/** What a list row needs from a workflow: the workflow plus its tools' companies. */
export type WorkflowListItem = {
  workflow: {
    key: string
    title: string
    author: string
    summary?: string
    toolCount: number
  }
  tools: ReadonlyArray<{
    companyKey: string
    companyName: string
    logoUrl?: string
    access: ReadonlyArray<AccessType>
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
