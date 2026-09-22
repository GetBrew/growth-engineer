import type { EntityType, TagNamespace } from './keys'

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

type Auth = {
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
  /** Failing this long drops the agent level one step (agent-level.ts). */
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

/* ─────────────────────────────── agent readiness ────────────────────────── */

export type AgentLevel = 'unverified' | 'native' | 'friendly' | 'possible'

type Agent = {
  level: AgentLevel
  /** 0–100, sorting within a level only. */
  score: number
  /** "Native: official remote MCP with self-serve OAuth." */
  reason: string
  machineReadableDocs?: boolean
  /** When a person last checked the facts; absent = unverified. */
  checkedAt?: number
}

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
  agent: Agent
  /** `agent.level`, flat, for lists and search. */
  agentLevel: AgentLevel
  /** Derived tag keys: `agent:<level>` and one `has:<type>` per way in. */
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
  key: string
  /** The handle before the slash: a company, or a person. */
  ownerKey: string
  title: string
  summary: string
  version: number
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
  /** `agent:*` and `has:*` are computed from tools, never authored. */
  derived: boolean
  counts: { companies: number; tools: number; workflows: number }
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
    agentLevel: AgentLevel
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
  workflow: { key: string; title: string; summary?: string; toolCount: number }
  tools: ReadonlyArray<{
    companyKey: string
    companyName: string
    logoUrl?: string
    access: ReadonlyArray<AccessType>
  }>
}

/* ───────────────────────────────── the map ──────────────────────────────── */

export type MapNode = {
  type: 'company' | 'tool' | 'workflow' | 'tag'
  key: string
  name: string
}

export type EdgeGroup = {
  /** Reads as a sentence from the focused node: "Clay" — makes → tools. */
  relation: string
  /** `out` = this node points at them; `in` = they point at this node. */
  direction: 'out' | 'in'
  nodes: Array<MapNode>
  isTruncated: boolean
}
