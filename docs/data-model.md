# Data model

`convex/schema.ts` is the source of truth (v0.3.1: the design doc's v0.3
"grilling decisions applied", plus two additive amendments — `auth.header`,
because the API section of a file renders the header the key is sent in and
v0.3 had nowhere to store it; and `by_format_top` / `by_format_new` on
`workflows`, so Top and New with a format read an index instead of
over-fetching). This page is the map.

## Identity

Every record has an internal `_id` — the only thing stored in reference
fields — and a public `key`, resolved once at the edge through a `by_key`
index. A **ref** is `${type}:${key}` and is what agents pass around.

| Entity | Key | Points to |
| --- | --- | --- |
| Company | `clay` | the team that claimed it |
| Tool | `clay/clay` — a company's only tool uses its product name | company |
| Workflow | `brew/intent-to-meeting`; `@3` pins a version; hacks use the same format | owning team or user, current version |
| Team / user | `brew`, `jdoe` — one shared handle namespace with companies | — |
| Tag | `capability:enrich-contacts` | parent tag, merged-into tag |

Rules: stored references are always ids; keys never change after publishing
(a merge or forced rename adds a `keyAliases` row and the old URL 308s); keys
use lowercase letters, digits and hyphens, 2–39 characters per part; reserved
words live in code (`convex/model/keys.ts`); workflow versions snapshot each
tool's key beside its id so files show readable refs with no lookups.

## Lifecycle

`draft › in_review › published › deprecated › archived`. A listing gets its
permanent key when first published. Deprecated stays visible with a warning;
archived is hidden, and its old keys keep redirecting. A tool is published
only with at least one way in.

## Entities

| Table | Job |
| --- | --- |
| `companies` | vendor, open-source org or individual; `domain`, `links`, `logo`, `claimedByTeamId`, `searchText` (projection) |
| `identifiers` | every domain, npm package, repo and MCP URL we match on — duplicate checks and vendor claims |
| `tools` | one product: `access[]` (the ways in), `agent` (level, score, reason, checkedAt), projections `agentLevel` + `searchText` |
| `workflows` | title phrased as the result; `visibility`, `moderation`, `currentVersionId`, `forkedFromId`; projections `format` (hack iff one tool), `listed`, `toolCount`, `trendScore`, `topScore`, `searchText` |
| `workflowVersions` | frozen once saved: `inputs`, `steps` (≤ 10, each with `toolId` + `toolKey` + optional `via`), `doneWhen`, `notes`, `scan` |
| `workflowTools` | projection of the current version's tools, with `listed` + `trendScore` copied so tool and company pages read straight from the index |
| `documents` | the rendered file per ref: `markdown`, `hash`, `lineCount`, `stale`, `renderedAt` |
| `tags` / `taggings` | the managed list (with synonyms, parents, aliases, counts) and the attachments, with sort values copied onto each row |
| `handles`, `users`, `teams`, `teamStack`, `reviews` | people: Clerk owns accounts and membership; teams form around a verified domain; stacks public by default; one review per person per tool |
| `submissions`, `agentRuns`, `revisions` | the pipeline: proposals from the community and scheduled jobs, job runs, and a hidden edit history |
| `events`, `entityStats`, `embeddings`, `keyAliases`, `apiKeys` | raw activity (90-day retention), rolled-up counts, vectors, redirects, free read keys |

## Agent access

A tool is published only if an agent can reach it over **MCP**, **CLI** or
**API**; the ways in are stored on the tool. Each carries `official` (or a
community `maintainer`), `auth` (`none` / `api_key` / `oauth`, the `envVar`,
the `header`, where to get a key, `selfServe`), `docsUrl` and `health`.

Levels come from rules checked from the top; the first match wins. A 0–100
score only sorts within a level. `convex/model/agent_level.ts`.

| Level | Rule |
| --- | --- |
| Unverified | Nobody has checked the facts yet — the default for new and discovered tools. |
| Native | An official MCP server or CLI, and credentials without a sales call. |
| Friendly | An official API, and self-serve credentials. |
| Possible | Only community-built access, or official access behind approval. |

Every tool shows why ("Native: official remote MCP with self-serve OAuth.");
it is `agent_note` in the file. Seven days of failing official health checks
drop a tool one level until it recovers; facts older than 90 days are
re-checked.

## Tags and search

Tags come from a managed list; the community proposes, moderators approve,
merge as synonyms, or reject. Two namespaces are computed and never proposable.

| Namespace | Answers | Set by |
| --- | --- | --- |
| `capability` | what does it do? | curators |
| `motion` | which go-to-market motion? | curators |
| `channel` | where does it act? | curators |
| `category` | what kind of product is it? | curators |
| `fit` | who is it good for? | curators |
| `agent` | how well can an agent use it? | computed |
| `has` | how can an agent reach it? | computed from access |

One box searches everything: words match names, summaries, tag labels and
synonyms; a typed chip like `agent:native` filters; a partial chip completes.
Chips in the same group mean OR, in different groups AND. A parent tag
includes its children (two levels at most). **Every search is a URL**
(`/tools?q=cold+outbound&has=mcp,cli`), and MCP `search` takes the same
values. The query plan is in `docs/architecture.md`.

## Teams and trust

Teams form around a verified work-email domain and later sign-ins join
automatically; personal-email users publish under their own handle. Stacks are
public by default. A team whose domain matches a company's identifier owns
the listing and edits it directly (history kept, checks still run). Anyone
signed in writes one review per tool, badged when their team uses it. New
workflows are shareable at once, scanned, then listed after approval.

## Ranking and discovery

Trending (7-day half-life) and Top (all-time), written hourly: copies and
agent fetches weigh most, saves and forks next, views least. Each person
counts once a day per workflow; verified-team actions count double; the
author's own team does not count; new workflows get a 48-hour boost.
Discovered listings match `identifiers` first (a match becomes an update),
always wait for a person, and expire after 30 days if low-confidence.

## Scaling rules

Files are rendered once and stored. Every read uses an index and every list is
paged. Counts never write to catalog records (sharded counters → `entityStats`).
Tag rows store their sort values. Large or rarely read data lives in its own
table. Anything unbounded is a table, not an array (Convex caps arrays at
8,192 items and documents at 1 MB). Public pages are cached per ref with
`cacheTag(ref)`. Raw events expire after 90 days.
