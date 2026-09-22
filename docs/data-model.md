# Data model: the file schema

The catalog is a tree of markdown files. This page is the map of that tree —
every entity, every field, every rule the build enforces, and the values it
derives. The schemas themselves live in `lib/content/schemas.ts`; the types
in `lib/catalog/types.ts`.

## Identity

The public `key` is the path, and the path is the URL:

| Entity | Key | Path | URL |
| --- | --- | --- | --- |
| Company | `clay` | `companies/clay/company.md` | `/companies/clay` |
| Tool | `clay/enrich-contacts` | `companies/clay/tools/enrich-contacts.md` | `/tools/clay/enrich-contacts` |
| Workflow | `brew/intent-to-meeting` | `workflows/brew/intent-to-meeting.md` | `/workflows/brew/intent-to-meeting` (`@3` pins a version) |
| Tag | `capability:enrich-contacts` | `tags/capability/enrich-contacts.md` | a filter chip |

A key part is lowercase letters, digits and hyphens, 2–39 characters, never
starting or ending with a hyphen. A handle (company, workflow owner) is one
part that is not a reserved route word (`tools`, `workflows`, `map`, …;
`lib/catalog/keys.ts`). Keys are never written in a header and never change
after publishing: a rename lists the old key under `aliases:`, and the old
URL answers with a 308.

## Companies — `companies/<handle>/company.md`

`name`, `domain`, `category` (a `tags/category/` slug), `logo` (a file under
`public/logos/`), `updated` (ISO date) are required. Optional: `kind`
(`vendor` default, `open_source`, `individual`), `tagline`, `website`
(defaults to `https://<domain>`), `docs`, `github`, `linkedin`, `x`,
`founded` (year), `headquarters`, `aliases`, `status` (`published` default,
`deprecated`). The body is the description.

## Ways in — `companies/<handle>/access/<id>.md`

One file per way in, shared by every tool of the company that lists it.
`type` is `mcp`, `cli` or `api`; `official` is a boolean and a community
option names its `maintainer`; `auth` is `{ method: none | api_key | oauth,
selfServe, envVar?, header?, keyUrl? }`; `docsUrl` is optional.

| Type | Fields |
| --- | --- |
| `mcp` | `transport: remote` with `url`, or `local` with `command`; `repoUrl?` |
| `cli` | `installCommand`, `binary`, `repoUrl?` |
| `api` | `baseUrl`, `openApiUrl?` |

## Tools — `companies/<handle>/tools/<slug>.md`

A tool is ONE function. The slug is a capability (`tags/capability/<slug>.md`
must exist). `name`, `summary`, `updated` are required. `access` maps an
access id to the **operation** — the MCP tool name, the CLI subcommand, or
`METHOD /path` — and a published tool needs at least one. `agent.checked`
(a date) records that a person verified the access facts;
`agent.machineReadableDocs` that OpenAPI or llms.txt exists. `status` is
`published` (default), `deprecated`, or `draft` (no page, no file, not
listed). `aliases` lists old slugs. The body is the description.

## Workflows — `workflows/<owner>/<name>.md`

`title` (phrased as the result), `summary`, `tags` (≥ 1, curated namespaces
only), `steps` (1–10 of `{ title, tool, via?, instruction }`), `doneWhen`
(≥ 1), `updated` are required. Optional: `version` (integer, default 1),
`inputs` (`{ name (snake_case), description, example? }`), `featured`
(unique rank on the featured list), `aliases`, `status`. The body is the
notes section. Every step's `tool` must be a published tool; `via` must be a
way in that tool has.

## Tags — `tags/<namespace>/<slug>.md`

`label` is required; `synonyms` feed search; the body is the required
description. Namespaces: `capability` (what a tool does), `motion`,
`channel`, `category` (of a company), `fit`. Two namespaces are DERIVED and
never files: `agent:<level>` and `has:<type>`, computed from each tool's
access.

## Agent readiness

Computed at build (`lib/catalog/agent-level.ts`) from a tool's ways in and
`agent.checked`. Rules top-down, first match wins:

| Level | When |
| --- | --- |
| **unverified** | no `agent.checked` — nobody has verified the facts |
| **native** | an official MCP server or CLI with self-serve credentials |
| **friendly** | an official API with self-serve credentials |
| **possible** | community access only, or official access behind approval |

The level and its reason appear in the file header (`agent`, `agent_note`).
A score (0–100) orders tools within a level and is never shown.

## What the build derives (never authored)

| Projection | From | Where |
| --- | --- | --- |
| `agentLevel`, `agent.reason`, `agent.score` | access + `agent.checked` | `agent-level.ts` |
| `has:*` and `agent:*` tags on a tool | access, level | `derived-tags.ts` |
| tag `counts` | published entities | `derive.ts` |
| `searchText` | name, summary, company, tag labels and synonyms | `derive.ts` |
| `toolKeys`, `toolCount`, workflow ↔ tool ↔ company edges | steps | `build-entities.ts`, `build-catalog.ts` |
| listing orders (featured, new, name) | `featured`, `updated`, `name` | `build-catalog.ts` |
| the rendered files, their hash and line count | everything above | `build-documents.ts` |

## Rules the build enforces

Every problem is reported at once, with its file path
(`pnpm content:check`): unknown header fields; malformed dates, URLs and env
var names; reserved or malformed handles and slugs; a tool slug that is not a
capability; an access id with no file; a published tool with no way in; a
step naming an unknown or draft tool; a `via` the tool lacks; an unknown or
derived tag; an unknown category; a missing logo; an alias that shadows a
live key or is claimed twice; two workflows with the same `featured` rank;
more than ten steps. `tests/content-schema.test.ts` proves each one fails.

## Not in this model, on purpose

Views, copies and ranking counters; teams, reviews and claims; submissions
and moderation queues; version history beyond the current version. Each was
designed for in the original schema and can return without changing a key or
a file — a pull request is the submission pipeline for now, and git history
is the version history.
