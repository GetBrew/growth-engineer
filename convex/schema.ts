/**
 * Growth.Engineer — convex/schema.ts   (v0.3.1: v0.3 grilling decisions + auth.header + by_format_top/new)
 *
 * What people see: companies, the tools they make, and workflows (growth hacks
 * are one-tool workflows). Every tool and workflow renders to ONE markdown
 * file that any agent can run. Copying that file is the whole product action.
 *
 * Identity
 *   _id   Internal pointer. The only thing stored in reference fields.
 *   key   Public, permanent pointer, resolved once at the edge via `by_key`.
 *           company    clay
 *           tool       clay/clay                 (a company's only tool uses its product name)
 *           workflow   brew/intent-to-meeting    (@3 pins a version; hacks use the same format)
 *           team/user  brew | jdoe               (one shared handle namespace)
 *           tag        capability:enrich-contacts
 *   ref   `${type}:${key}`, e.g. tool:clay/clay
 *
 * Rules
 *   - A tool is only published with at least one way in: MCP, CLI, or API.
 *   - Markdown files are generated from these fields, never hand-edited.
 *   - PROJECTION fields are rewritten by one helper (or a scheduled batch).
 *   - Hot counters never touch catalog docs.
 *
 * Not in v1: pricing and cost, standalone connector pages, skills/SDKs/webhooks
 * as access types, write API (arrives with Clerk).
 */

import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/* ───────────────────────────── shared validators ───────────────────────────── */

const lifecycle = v.union(
  v.literal('draft'),
  v.literal('in_review'),
  v.literal('published'),
  v.literal('deprecated'), // visible with a warning
  v.literal('archived') // hidden; old keys still redirect
)

const provenance = v.object({
  source: v.union(
    v.literal('admin'),
    v.literal('vendor'),
    v.literal('community'),
    v.literal('agent')
  ),
  submissionId: v.optional(v.id('submissions')),
  createdBy: v.optional(v.id('users')),
})

const entityType = v.union(
  v.literal('company'),
  v.literal('tool'),
  v.literal('workflow')
)
const entityId = v.union(v.id('companies'), v.id('tools'), v.id('workflows'))

const keyedType = v.union(
  v.literal('company'),
  v.literal('tool'),
  v.literal('workflow'),
  v.literal('team'),
  v.literal('user'),
  v.literal('tag')
)
const keyedId = v.union(
  v.id('companies'),
  v.id('tools'),
  v.id('workflows'),
  v.id('teams'),
  v.id('users'),
  v.id('tags')
)

/* ── How an agent reaches a tool (embedded on the tool) ── */

const auth = v.object({
  method: v.union(v.literal('none'), v.literal('api_key'), v.literal('oauth')),
  envVar: v.optional(v.string()), // "CLAY_API_KEY", named in the markdown file
  // v0.3.1 amendment: the header the key is sent in ("Authorization: Bearer",
  // "X-Api-Key"). The design doc's API section renders "the auth header"; the
  // schema had nowhere to store it. Absent = "Authorization: Bearer".
  header: v.optional(v.string()),
  keyUrl: v.optional(v.string()), // where the user gets a key
  selfServe: v.boolean(), // false = needs a sales call or approval
})

const health = v.optional(
  v.object({
    ok: v.boolean(),
    checkedAt: v.number(),
    failingSince: v.optional(v.number()), // 7 days failing → level drops one step
  })
)

const accessCommon = {
  official: v.boolean(), // false = community-maintained
  maintainer: v.optional(v.string()), // handle or name when not official
  auth,
  docsUrl: v.optional(v.string()),
  health,
}

const accessType = v.union(v.literal('mcp'), v.literal('cli'), v.literal('api'))

const access = v.union(
  v.object({
    type: v.literal('mcp'),
    ...accessCommon,
    transport: v.union(v.literal('remote'), v.literal('local')),
    url: v.optional(v.string()), // remote
    command: v.optional(v.string()), // local, e.g. "npx -y @vendor/mcp"
    repoUrl: v.optional(v.string()),
  }),
  v.object({
    type: v.literal('cli'),
    ...accessCommon,
    installCommand: v.string(),
    binary: v.string(),
    repoUrl: v.optional(v.string()),
  }),
  v.object({
    type: v.literal('api'),
    ...accessCommon,
    baseUrl: v.string(),
    openApiUrl: v.optional(v.string()),
  })
)

/* ── Agent readiness: levels by rule, score only for sorting ── */

const agentLevel = v.union(
  v.literal('unverified'), // facts not checked yet (default for new listings)
  v.literal('native'), // official MCP or CLI + self-serve auth
  v.literal('friendly'), // official API + self-serve auth
  v.literal('possible') // community access only, or official access behind approval
)

const agent = v.object({
  level: agentLevel,
  score: v.number(), // 0–100, sorting within a level only
  reason: v.string(), // "Native: official remote MCP with self-serve OAuth."
  machineReadableDocs: v.optional(v.boolean()), // hand-checked: OpenAPI or llms.txt
  checkedAt: v.optional(v.number()), // undefined → unverified; re-checked every 90 days
  computedAt: v.number(),
})

/* ── Tags ── */

const tagNamespace = v.union(
  v.literal('capability'), // enrich-contacts, find-work-emails, send-email
  v.literal('motion'), // outbound, inbound, midbound, plg, abm
  v.literal('channel'), // email, linkedin, phone, ads, website
  v.literal('category'), // data-provider, sequencer, crm, intent
  v.literal('fit'), // b2b-saas, agencies, ecommerce, smb, enterprise
  v.literal('agent'), // DERIVED: unverified | native | friendly | possible
  v.literal('has') // DERIVED from access: mcp | cli | api
)

const taggingBase = {
  tagId: v.id('tags'),
  namespace: tagNamespace, // PROJECTION
  derived: v.boolean(), // PROJECTION
  listed: v.boolean(), // PROJECTION: entity is published and public
  popularity: v.number(), // PROJECTION: ranking job
  publishedAt: v.number(), // PROJECTION: 0 when unpublished
}

export default defineSchema({
  /* ═══════════════════════════════ CATALOG ═══════════════════════════════ */

  companies: defineTable({
    key: v.string(), // handle: "clay"
    name: v.string(),
    kind: v.union(
      v.literal('vendor'),
      v.literal('open_source'),
      v.literal('individual')
    ),
    domain: v.optional(v.string()), // primary; all identifiers live in `identifiers`
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(
      v.object({
        url: v.string(),
        storageId: v.optional(v.id('_storage')),
        fetchedAt: v.number(), // context.dev, refreshed automatically
      })
    ),
    links: v.object({
      website: v.optional(v.string()),
      docs: v.optional(v.string()),
      github: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      x: v.optional(v.string()),
    }),
    claimedByTeamId: v.optional(v.id('teams')), // set when a verified team's domain matches
    status: lifecycle,
    publishedAt: v.optional(v.number()),
    provenance,
    searchText: v.string(), // PROJECTION
  })
    .index('by_key', ['key'])
    .index('by_domain', ['domain'])
    .index('by_status_published', ['status', 'publishedAt'])
    .searchIndex('search_companies', {
      searchField: 'searchText',
      filterFields: ['status'],
    }),

  // Every external identifier we match on: duplicate checks and vendor claims.
  // value: "domain:clay.com" | "npm:@clay/mcp" | "gh:clay/cli" | "mcp:https://…" | "producthunt:clay"
  identifiers: defineTable({
    value: v.string(),
    entityType: v.union(v.literal('company'), v.literal('tool')),
    entityId: v.union(v.id('companies'), v.id('tools')),
  })
    .index('by_value', ['value'])
    .index('by_entity', ['entityId']),

  tools: defineTable({
    companyId: v.id('companies'),
    key: v.string(), // "clay/clay"
    name: v.string(),
    summary: v.string(), // one sentence: what it does
    description: v.optional(v.string()),
    access: v.array(access), // at least one entry to publish
    agent,
    status: lifecycle,
    publishedAt: v.optional(v.number()),
    provenance,
    // PROJECTIONS
    agentLevel, // = agent.level, for the search index
    searchText: v.string(), // name + company + summary + tag labels + synonyms
  })
    .index('by_key', ['key'])
    .index('by_company', ['companyId', 'status'])
    .index('by_status_published', ['status', 'publishedAt'])
    .index('by_agent_level', ['status', 'agentLevel', 'publishedAt'])
    .searchIndex('search_tools', {
      searchField: 'searchText',
      filterFields: ['status', 'agentLevel', 'companyId'],
    }),

  /* ══════════════════════════════ WORKFLOWS ══════════════════════════════ */

  workflows: defineTable({
    key: v.string(), // "brew/intent-to-meeting"
    title: v.string(), // phrased as the result
    summary: v.optional(v.string()),
    authorId: v.optional(v.id('users')),
    teamId: v.optional(v.id('teams')),
    visibility: v.union(v.literal('public'), v.literal('private')),
    moderation: v.union(
      v.literal('pending'), // live at an unlisted link, not in search or feeds
      v.literal('approved'),
      v.literal('flagged'),
      v.literal('rejected')
    ),
    status: lifecycle,
    currentVersionId: v.optional(v.id('workflowVersions')),
    forkedFromId: v.optional(v.id('workflows')),
    publishedAt: v.optional(v.number()),
    provenance,
    // PROJECTIONS
    format: v.union(v.literal('hack'), v.literal('workflow')), // hack = one distinct tool
    listed: v.boolean(), // published && public && approved
    toolCount: v.number(),
    trendScore: v.number(), // 7-day half-life, ranking job
    topScore: v.number(), // all-time, ranking job
    searchText: v.string(),
  })
    .index('by_key', ['key'])
    .index('by_trending', ['listed', 'trendScore'])
    .index('by_top', ['listed', 'topScore'])
    .index('by_new', ['listed', 'publishedAt'])
    .index('by_format_trending', ['listed', 'format', 'trendScore'])
    .index('by_format_top', ['listed', 'format', 'topScore'])
    .index('by_format_new', ['listed', 'format', 'publishedAt'])
    .index('by_team', ['teamId', 'status'])
    .index('by_author', ['authorId', 'status'])
    .index('by_moderation', ['moderation', 'status'])
    .searchIndex('search_workflows', {
      searchField: 'searchText',
      filterFields: ['listed', 'format'],
    }),

  // Frozen once saved. Edits create version N+1; a flagged version never replaces
  // the live one until a moderator clears it.
  workflowVersions: defineTable({
    workflowId: v.id('workflows'),
    version: v.number(),
    summary: v.optional(v.string()),
    inputs: v.array(
      v.object({
        name: v.string(), // snake_case, shown in backticks; the agent asks the user
        description: v.string(),
        example: v.optional(v.string()),
      })
    ),
    steps: v.array(
      v.object({
        key: v.string(), // "find-contacts"
        title: v.string(), // "Find contacts"
        toolId: v.id('tools'),
        toolKey: v.string(), // keys are permanent, safe to snapshot
        via: v.optional(accessType), // preferred way in; default = best available
        instruction: v.string(),
        dependsOn: v.optional(v.array(v.string())),
      })
    ), // at most 10
    doneWhen: v.array(v.string()),
    notes: v.optional(v.string()), // optional author markdown
    scan: v.object({
      status: v.union(
        v.literal('pending'),
        v.literal('clean'),
        v.literal('flagged')
      ),
      reasons: v.array(v.string()),
      scannedAt: v.optional(v.number()),
    }),
    createdBy: v.optional(v.id('users')),
  }).index('by_workflow', ['workflowId', 'version']),

  // PROJECTION of the current version's steps
  workflowTools: defineTable({
    workflowId: v.id('workflows'),
    toolId: v.id('tools'),
    companyId: v.id('companies'),
    listed: v.boolean(),
    trendScore: v.number(),
  })
    .index('by_tool', ['toolId', 'listed', 'trendScore'])
    .index('by_company', ['companyId', 'listed', 'trendScore'])
    .index('by_workflow', ['workflowId']),

  /* ═══════════════════════════ MARKDOWN FILES ════════════════════════════ */

  // The rendered file for each company, tool, and workflow. Pages, the Copy
  // button, `.md` URLs, and MCP `get` all read one row. Rendered by a single
  // function; when a tool changes, every workflow using it is marked stale and
  // re-rendered in a scheduled batch.
  documents: defineTable({
    ref: v.string(), // "tool:clay/clay", "workflow:brew/intent-to-meeting"
    entityType,
    entityId,
    markdown: v.string(),
    hash: v.string(),
    lineCount: v.number(),
    stale: v.boolean(),
    renderedAt: v.number(),
  })
    .index('by_ref', ['ref'])
    .index('by_entity', ['entityId'])
    .index('by_stale', ['stale', 'renderedAt']),

  /* ═════════════════════════════════ TAGS ════════════════════════════════ */

  tags: defineTable({
    key: v.string(), // "capability:enrich-contacts"
    namespace: tagNamespace,
    slug: v.string(),
    label: v.string(),
    synonyms: v.array(v.string()), // grows when proposals are merged
    description: v.optional(v.string()), // required before a tag becomes active
    parentTagId: v.optional(v.id('tags')), // two levels at most
    aliasOfTagId: v.optional(v.id('tags')),
    derived: v.boolean(), // agent:* and has:* are system-only, never proposable
    status: v.union(
      v.literal('active'),
      v.literal('proposed'),
      v.literal('retired')
    ),
    counts: v.object({
      companies: v.number(),
      tools: v.number(),
      workflows: v.number(),
    }),
    searchText: v.string(), // PROJECTION: label + synonyms
  })
    .index('by_key', ['key'])
    .index('by_namespace', ['namespace', 'status'])
    .searchIndex('search_tags', {
      searchField: 'searchText',
      filterFields: ['namespace', 'status'],
    }),

  taggings: defineTable(
    v.union(
      v.object({
        ...taggingBase,
        entityType: v.literal('company'),
        entityId: v.id('companies'),
      }),
      v.object({
        ...taggingBase,
        entityType: v.literal('tool'),
        entityId: v.id('tools'),
      }),
      v.object({
        ...taggingBase,
        entityType: v.literal('workflow'),
        entityId: v.id('workflows'),
      })
    )
  )
    .index('by_tag_popular', ['tagId', 'entityType', 'listed', 'popularity'])
    .index('by_tag_new', ['tagId', 'entityType', 'listed', 'publishedAt'])
    .index('by_entity_tag', ['entityId', 'tagId']),

  /* ═══════════════════════════════ PEOPLE ════════════════════════════════ */
  // Clerk owns accounts, organizations, verified domains, and membership.

  handles: defineTable(
    v.union(
      v.object({
        handle: v.string(),
        ownerType: v.literal('company'),
        ownerId: v.id('companies'),
      }),
      v.object({
        handle: v.string(),
        ownerType: v.literal('team'),
        ownerId: v.id('teams'),
      }),
      v.object({
        handle: v.string(),
        ownerType: v.literal('user'),
        ownerId: v.id('users'),
      })
    )
  ).index('by_handle', ['handle']),

  users: defineTable({
    handle: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('member')
    ),
    teamId: v.optional(v.id('teams')), // PROJECTION from Clerk; empty for personal email
  })
    .index('by_handle', ['handle'])
    .index('by_clerk_id', ['clerkUserId'])
    .index('by_email', ['email'])
    .index('by_team', ['teamId']),

  teams: defineTable({
    key: v.string(), // handle; uses the company's handle when the domain matches
    name: v.string(),
    clerkOrgId: v.string(),
    companyId: v.optional(v.id('companies')),
    stackVisibility: v.union(v.literal('public'), v.literal('private')), // default public
  })
    .index('by_key', ['key'])
    .index('by_clerk_org', ['clerkOrgId']),

  teamStack: defineTable({
    teamId: v.id('teams'),
    toolId: v.id('tools'),
    companyId: v.id('companies'), // PROJECTION
    status: v.union(
      v.literal('using'),
      v.literal('evaluating'),
      v.literal('churned')
    ),
    usedForTagIds: v.optional(v.array(v.id('tags'))),
    note: v.optional(v.string()),
    addedBy: v.id('users'),
    teamIsPublic: v.boolean(), // PROJECTION of teams.stackVisibility
  })
    .index('by_team', ['teamId', 'status'])
    .index('by_tool', ['toolId', 'teamIsPublic', 'status'])
    .index('by_team_tool', ['teamId', 'toolId']),

  // Anyone signed in. One per person per tool. Vendor team members can't review
  // their own company's tools. Reported reviews are hidden until checked.
  reviews: defineTable({
    toolId: v.id('tools'),
    userId: v.id('users'),
    teamId: v.optional(v.id('teams')),
    rating: v.number(), // 1–5
    body: v.optional(v.string()),
    verifiedUsage: v.boolean(), // reviewer's team stack lists the tool as "using"
    status: v.union(
      v.literal('published'),
      v.literal('hidden'),
      v.literal('reported')
    ),
  })
    .index('by_tool', ['toolId', 'status'])
    .index('by_user_tool', ['userId', 'toolId']),

  /* ══════════════════════════════ PIPELINE ═══════════════════════════════ */

  // Community and discovery proposals. Vendor edits to their own listing skip
  // this table and go straight to `revisions`.
  submissions: defineTable({
    source: v.union(v.literal('community'), v.literal('agent')),
    submittedBy: v.optional(v.id('users')),
    agentRunId: v.optional(v.id('agentRuns')),
    action: v.union(
      v.literal('create'),
      v.literal('update'),
      v.literal('deprecate'),
      v.literal('merge')
    ),
    entityType: v.union(
      v.literal('company'),
      v.literal('tool'),
      v.literal('workflow'),
      v.literal('tag')
    ),
    targetRef: v.optional(v.string()),
    targetId: v.optional(v.string()),
    matchedEntityId: v.optional(entityId), // found via identifiers → becomes an update
    payload: v.any(), // validated per entityType when applied
    evidence: v.array(
      v.object({
        url: v.string(),
        note: v.optional(v.string()),
        capturedAt: v.number(),
      })
    ),
    dedupeKey: v.optional(v.string()), // primary identifier value
    confidence: v.optional(v.number()), // agent only; < 0.5 expires after 30 days
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('duplicate'),
      v.literal('applied'),
      v.literal('expired')
    ),
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
  })
    .index('by_status_source', ['status', 'source'])
    .index('by_dedupe', ['dedupeKey', 'status'])
    .index('by_target', ['targetId', 'status']),

  agentRuns: defineTable({
    job: v.string(), // "discover_producthunt" | "check_health" | "refresh_logos"
    status: v.union(
      v.literal('running'),
      v.literal('succeeded'),
      v.literal('failed')
    ),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    stats: v.object({
      scanned: v.number(),
      proposed: v.number(),
      duplicates: v.number(),
      autoApplied: v.number(),
      errors: v.number(),
    }),
    error: v.optional(v.string()),
  }).index('by_job', ['job', 'startedAt']),

  // Hidden edit history so admins can see and undo any change.
  revisions: defineTable({
    entityType: keyedType,
    entityId: keyedId,
    actor: v.union(
      v.literal('admin'),
      v.literal('vendor'),
      v.literal('community'),
      v.literal('automated')
    ),
    userId: v.optional(v.id('users')),
    patch: v.any(),
    previous: v.any(),
  }).index('by_entity', ['entityId']),

  /* ═══════════════════════════════ SYSTEM ════════════════════════════════ */

  events: defineTable({
    type: v.union(
      v.literal('view'),
      v.literal('copy'), // Copy prompt on the web
      v.literal('agent_fetch'), // .md URL or MCP get
      v.literal('save'),
      v.literal('fork')
    ),
    entityType,
    entityId,
    workflowVersionId: v.optional(v.id('workflowVersions')),
    userId: v.optional(v.id('users')),
    actorKey: v.string(), // user id or hashed session; counted once per day
    verifiedTeam: v.boolean(), // counts double in ranking
    authorTeam: v.boolean(), // author's own team; ignored in ranking
    via: v.union(v.literal('web'), v.literal('mcp'), v.literal('api')),
    day: v.string(),
  })
    .index('by_entity_type_day', ['entityId', 'type', 'day'])
    .index('by_dedupe', ['actorKey', 'entityId', 'type', 'day'])
    .index('by_day', ['day']), // 90-day retention sweep

  entityStats: defineTable({
    entityType,
    entityId,
    views: v.number(),
    copies: v.number(),
    agentFetches: v.number(),
    saves: v.number(),
    forks: v.number(),
    teamsUsing: v.number(),
    reviewCount: v.number(),
    ratingSum: v.number(),
    updatedAt: v.number(),
  }).index('by_entity', ['entityId']),

  embeddings: defineTable({
    entityType,
    entityId,
    model: v.string(),
    textHash: v.string(),
    vector: v.array(v.float64()),
    listed: v.boolean(),
  })
    .index('by_entity', ['entityId', 'model'])
    .vectorIndex('by_vector', {
      vectorField: 'vector',
      dimensions: 1536,
      filterFields: ['entityType', 'listed'],
    }),

  keyAliases: defineTable({
    entityType: keyedType,
    oldKey: v.string(),
    entityId: keyedId,
  }).index('by_type_key', ['entityType', 'oldKey']),

  // Optional free keys for higher read limits (rate limiting via the Convex
  // rate-limiter component; anonymous reads are limited per IP).
  apiKeys: defineTable({
    hash: v.string(),
    label: v.string(),
    userId: v.optional(v.id('users')),
    email: v.optional(v.string()),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index('by_hash', ['hash'])
    .index('by_user', ['userId']),
})
