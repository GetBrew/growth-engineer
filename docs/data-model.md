# Data model: the file schema

The catalog is a tree of markdown files. This page is the map of that tree —
every entity, every field, every rule the build enforces, and the values it
derives. The schemas themselves live in `lib/schemas/content.ts`; the types
in `lib/types/catalog.ts`.

## Identity

The public `key` is the path, and the path is the URL:

| Entity | Key | Path | URL |
| --- | --- | --- | --- |
| Company | `apollo` | `companies/apollo/company.md` | `/companies/apollo` |
| Tool | `apollo/enrich-person` | `companies/apollo/tools/enrich-person.md` (named after the function) | `/tools/apollo/enrich-person` |
| Workflow | `funding-signal-outbound` | `workflows/funding-signal-outbound.md` | `/workflows/funding-signal-outbound` |
| Tag | `capability:enrich-contacts` | an entry in `tags.yml` | a filter chip |

A key part is lowercase letters, digits and hyphens, 2–39 characters, never
starting or ending with a hyphen. A company handle is one part that is not a
reserved route word (`tools`, `workflows`, `map`, …;
`lib/catalog/keys.ts`). Keys are never written in a header and never change
after publishing: a rename lists the old key under `aliases:`, and the old
URL answers with a 308.

## Companies — `companies/<handle>/company.md`

`name`, `domain`, `category` (a `category:` entry in `tags.yml`), `logo` (a file under
`public/logos/`), `updated` (ISO date) are required. Optional: `tagline`,
`docs`, `github`, `aliases`, `status` (`published` default, `deprecated`).
The website is always `https://<domain>`. The body is the description.

### Ways in — `mcp:`, `cli:`, `api:` in company.md

How an agent reaches the company, at most one of each, shared by all its
tools. Every way has `auth` (`none`, `oauth`, `api_key`), optional `docs`,
and `maintainer` when community-run (absent = official). An API key names
its `env` var (required) and optionally a `keyUrl`.

| Way | Fields |
| --- | --- |
| `mcp` | exactly one of `url` (remote) or `command` (local; plain words, no quotes); a remote server with `api_key` is refused |
| `cli` | `install`, `binary` |
| `api` | `url` (the base), `header?` (`X-Api-Key`, `Authorization: Basic`) |

## Tools — `companies/<handle>/tools/<name>.md`

A tool is ONE function, and its file is named after it. `name`, `summary`,
`capability` (a `capability:` entry in `tags.yml`) and `updated` are
required. The calls are top-level: `mcp:` (the tool name), `cli:` (starting
with the company's binary) and `api:` (`METHOD /path`), each on a way the
company declares; a published tool needs at least one. `docs` is the page
that names the call. `status` is `published` (default), `deprecated`, or
`draft` (no page, no file, not listed). `aliases` lists old keys. The body
is the description.

## Workflows — `workflows/<name>.md` (flat)

Workflows are by people: `author` is a GitHub login (letters, digits, single
hyphens), shown as `@login` and linked to the profile; it is never a company.

The HEADER holds the facts: `title` (phrased as the result), `summary`,
`author` and `updated` are required; `tags` (motion and channel only),
`featured` (a rank unique across every workflow file), `aliases` and
`status` are optional. There are no versions: git history is the archive.

### Status, one rule

`status` is `published` (default), `deprecated` (visible, with a warning) or
`draft` (checked, never published: no page, no file, no list) — for tools
and workflows alike. A workflow's steps must fit its status: a published one
uses published tools; a deprecated one, published or deprecated tools; a
draft, any tool file. A company is `published` or `deprecated`, gets a page
and a file once it has a tool that is not a draft, and is listed once it has
a published one.

The BODY holds the workflow itself, in the markdown the rendered file uses,
so the source reads on GitHub the way it reads on the site
(`lib/content/workflow-body.ts`). Four sections, in order:

| Section | Entries | Becomes |
| --- | --- | --- |
| `## Inputs` (optional) | ``- `name`: description, e.g. example`` | `inputs`: `{ name (snake_case), description, example? }` |
| `## Steps` (1–10) | ``1. **Title** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Instruction.`` — a link to the tool's source file | `steps`: `{ title, tool, instruction }` |
| `## Done when` (≥ 1) | `- A check.` | `doneWhen` |
| `## Notes` (optional) | free markdown; `###` and smaller headings, none named like a section the file writes | `notes` |

A step names its tool by a link to the tool's source file (the link must
point at that file). Every step's tool must be a published tool. Any other
heading, text
outside a section, or a header field that belongs in the body is an error
with its line number.

## Tags — `tags.yml`

One file holds the whole vocabulary: `<namespace>: { <slug>: { label,
synonyms? } }`. `label` is required; `synonyms` feed search. Namespaces:
`capability` (what a tool does), `category` (of a company), `channel` and
`motion` (of a workflow). One namespace is DERIVED and never written:
`has:<type>`, computed from each tool's ways in.

Every entity carries the tags it earns, computed at build: a tool its
capability, its company's category and its ways in; a company its category
and its published tools' capabilities and ways in; a workflow its motion and
channel tags, its tools' capabilities, and `has:<type>` when every tool
offers that way.

## What the build derives (never authored)

| Projection | From | Where |
| --- | --- | --- |
| every entity's `tags` (capability, category, `has:*`) | its file, its company, its tools | `derive.ts` |
| `searchText` | its words plus its tags' labels and synonyms | `derive.ts` |
| `toolKeys`, `toolCount` | steps | `build-workflows.ts` |
| the edges: company ↔ tools ↔ workflows, tag members — written into both rendered files (`tools:` / `workflows:`) | tool folders, step links, tags | `build-relations.ts`, read through `relationsOf` |
| tag `counts` | the tag's members | `build-relations.ts` |
| listing orders (featured, new, name) | `featured`, `updated`, `name` | `build-catalog.ts` |
| the rendered files and their line count | everything above | `build-documents.ts` |
| each file's `sources`: its own file, then every tool file and company file (where the ways in live) whose facts it prints | the files above | `build-documents.ts` |

## Rules the build enforces

Every problem is reported at once, with its file path
(`pnpm content:check`): unknown header fields; malformed dates, URLs and env
var names; reserved or malformed handles and names; a capability or category
missing from `tags.yml`; a call on a way the company does not declare, or in
the wrong shape; an MCP way with both or neither of `url` and `command`; an
API key with no `env`; a published tool with no call; a step whose tool does
not fit the workflow's status; an unknown or derived tag; an unknown
category; a missing logo; an alias that shadows an existing key (drafts
included) or is claimed twice; two workflows with the same `featured` rank;
more than ten steps. `tests/content-schema.test.ts` proves each one fails.

## Not in this model, on purpose

Views, copies and ranking counters; teams, reviews and claims; submissions
and moderation queues; versions and their history. Each was
designed for in the original schema and can return without changing a key or
a file — a pull request is the submission pipeline for now, and git history
is the version history.
