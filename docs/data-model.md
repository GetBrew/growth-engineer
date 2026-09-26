# Data model: the file schema

The catalog is a tree of markdown files. This page is the map of that tree —
every entity, every field, every rule the build enforces, and the values it
derives. The schemas themselves live in `lib/schemas/content.ts`; the types
in `lib/types/catalog.ts`.

## Identity

The public `key` is the path, and the path is the URL:

| Entity | Key | Path | URL |
| --- | --- | --- | --- |
| Company | `clay` | `companies/clay/company.md` | `/companies/clay` |
| Tool | `clay/enrich-contacts` | `companies/clay/tools/enrich-contacts.md` | `/tools/clay/enrich-contacts` |
| Workflow | `funding-signal-outbound` | `workflows/funding-signal-outbound.md` | `/workflows/funding-signal-outbound` (`@1` pins a version) |
| Tag | `capability:enrich-contacts` | `tags/capability/enrich-contacts.md` | a filter chip |

A key part is lowercase letters, digits and hyphens, 2–39 characters, never
starting or ending with a hyphen. A company handle is one part that is not a
reserved route word (`tools`, `workflows`, `map`, …;
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
`METHOD /path` — and a published tool needs at least one. `status` is
`published` (default), `deprecated`, or `draft` (no page, no file, not
listed). `aliases` lists old slugs. The body is the description.

## Workflows — `workflows/<name>.md` (flat)

Workflows are by people: `author` is a GitHub login (letters, digits, single
hyphens), shown as `@login` and linked to the profile; it is never a company.

The HEADER holds the facts: `title` (phrased as the result), `summary`,
`author`, `tags` (≥ 1, curated namespaces only) and `updated` are required;
`version` (integer, default 1), `featured` (unique rank on the featured
list), `aliases` and `status` are optional.

The BODY holds the workflow itself, in the markdown the rendered file uses,
so the source reads on GitHub the way it reads on the site
(`lib/content/workflow-body.ts`). Four sections, in order:

| Section | Entries | Becomes |
| --- | --- | --- |
| `## Inputs` (optional) | ``- `name`: description, e.g. example`` | `inputs`: `{ name (snake_case), description, example? }` |
| `## Steps` (1–10) | ``1. **Title** with `handle/slug` via MCP. Instruction.`` — the tool may instead be a link to its file, `../companies/<handle>/tools/<slug>.md` | `steps`: `{ title, tool, via?, instruction }` |
| `## Done when` (≥ 1) | `- A check.` | `doneWhen` |
| `## Notes` (optional) | free markdown | `notes` |

A step names its tool by key, as a code span or as a link to the tool's
source file (the link must point at that file). Every step's tool must be a
published tool; `via` must be a way in that tool has. Any other heading, text
outside a section, or a header field that belongs in the body is an error
with its line number.

## Tags — `tags/<namespace>/<slug>.md`

`label` is required; `synonyms` feed search; the body is the required
description. Namespaces: `capability` (what a tool does), `motion`,
`channel`, `category` (of a company), `fit`. One namespace is DERIVED and
never files: `has:<type>`, computed from each tool's access.

## What the build derives (never authored)

| Projection | From | Where |
| --- | --- | --- |
| `has:*` tags on a tool | access | `derived-tags.ts` |
| tag `counts` | published entities | `derive.ts` |
| `searchText` | name, summary, company, tag labels and synonyms | `derive.ts` |
| `toolKeys`, `toolCount`, workflow ↔ tool ↔ company edges — written into both rendered files (`tools:` / `workflows:`) | steps | `build-entities.ts`, `build-catalog.ts`, `build-documents.ts` |
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
