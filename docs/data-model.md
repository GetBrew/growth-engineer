# Data model: what the build reads, derives and enforces

The catalog is a tree of markdown files. The fields of each file, with
templates, are in the folder READMEs — [`companies/`](../companies/README.md)
(companies, their ways in, their tools and logos) and
[`workflows/`](../workflows/README.md) — and the vocabulary explains itself
at the top of [`tags.yml`](../tags.yml). This page covers what those READMEs
don't: identity, status, what the build computes, and every rule it
enforces. The schemas live in `lib/schemas/content.ts`; the types in
`lib/types/catalog.ts`.

## Identity

The public `key` is the path, and the path is the URL:

| Entity | Key | Path | URL |
| --- | --- | --- | --- |
| Company | `apollo` | `companies/apollo/company.md` | `/companies/apollo` |
| Tool | `apollo/enrich-person` | `companies/apollo/tools/enrich-person.md` (named after the function) | `/tools/apollo/enrich-person` |
| Workflow | `funding-signal-outbound` | `workflows/funding-signal-outbound.md` | `/workflows/funding-signal-outbound` |
| Tag | `capability:enrich-contacts` | an entry in `tags.yml` | a filter chip, and `/tags/capability/enrich-contacts.md` |

A key part is lowercase letters, digits and hyphens, 2–39 characters, never
starting or ending with a hyphen. A company handle is one part that is not a
reserved route word (`tools`, `workflows`, `mcp`, `logos`, …;
`lib/catalog/keys.ts`). Keys are never written in a header and never change
after publishing: a rename lists the old key under `aliases:`, and the old
URL answers with a 308.

## Status, one rule

`status` is `published` (default), `deprecated` (visible, with a warning) or
`draft` (checked, never published: no page, no file, no list) — for tools
and workflows alike. A workflow's steps must fit its status: a published one
uses published tools; a deprecated one, published or deprecated tools; a
draft, any tool file. A company is `published` or `deprecated`, gets a page
and a file once it has a tool that is not a draft, and is listed once it has
a published one.

## Tags

`tags.yml` holds four curated namespaces: `capability` (what a tool does),
`category` (of a company), `channel` and `motion` (of a workflow). One
namespace is derived and never written: `has:<type>`, from each tool's ways
in.

Every entry carries the tags it earns, computed at build: a tool its
capability, its company's category and its ways in; a company its category
and its published tools' capabilities and ways in; a workflow the one motion
it names (`motion:`, like a company's `category:`), its channel tags, its
tools' capabilities, and `has:<type>` when every tool offers that way.

## What the build computes (never written in a file)

| Value | From | Where |
| --- | --- | --- |
| every entry's `tags` (capability, category, `has:*`) | its file, its company, its tools | `derive.ts` |
| `searchText` | its words plus its tags' labels and synonyms | `derive.ts` |
| a shared call's `endpoint` | a generic operation several of a company's tools share (`stripe_api_read`) carries each tool's API call, so files say `with GET /v1/invoices` | `build-tools.ts` |
| `toolKeys` | the steps that name a tool | `build-workflows.ts` |
| the links: company ↔ tools ↔ workflows, and each tag's members — written into both rendered files (`tools:` / `workflows:`) | tool folders, step links, tags | `build-relations.ts`, read through `relationsOf` |
| tag `counts` | the tag's members | `build-relations.ts` |
| listing orders (featured, new, name) | `featured`, a workflow's `added` (a tool's `updated`), `name` | `build-catalog.ts` |
| the rendered files and their line counts | everything above | `build-documents.ts` |

A rendered file's `updated` is the newest `updated` of every source file
that fed it: a tool's file moves when its company's ways in change, a
workflow's when any of its tools or their companies change.

## Rules the build enforces

Every problem is reported at once, with its file path, and its line when it
is in a workflow's body (`pnpm content:check`):

- unknown header fields; malformed dates, URLs and env var names; one-line
  fields with a line break, or a `summary` or `tagline` that opens a
  markdown block
- reserved or malformed handles and names; a file or folder that fits no slot
- a company with no logo: neither a `logo:` URL nor a `logo.<ext>` file
  waiting for upload; a `logo:` that is not a cdn.growth.engineer logo URL,
  or is another company's; a logo file over 32 KB, not square, smaller than
  64px, not the format its name says, or an SVG that runs script, loads a
  file or follows the viewer's theme ([`docs/maintainers/logos.md`](maintainers/logos.md))
- a capability, category or tag missing from `tags.yml`, or a derived tag
  written by hand
- a call on a way the company does not declare, or in the wrong shape; an API
  path parameter written `:param`
- an MCP way with both or neither of `url` and `command`; a remote MCP way
  with an API key; an API key with no `env`
- a `{placeholder}` that is not snake_case, or has no way `notes`; `notes`
  over 280 characters
- a published tool with no call or no `docs`; a tool file with a body
- a workflow step whose tool does not exist or does not fit the workflow's
  status; a workflow whose steps name no tool; more than ten steps; a body
  section out of order or misnamed
- a workflow with no `motion`, a motion missing from `tags.yml`, or a
  `motion:` tag in `tags:`; no `## Outcome`, or more than four items in it;
  a title over 60 characters or a summary over 140
- an alias that shadows an existing key (drafts included) or is claimed twice
- a file that renders past its line cap (tool or company ≈ 80, workflow ≈
  200) — checked once everything above passes, since only a valid catalog
  renders

`tests/content-schema.test.ts` proves each one fails.

## Not in this model, on purpose

Teams, reviews and claims; submissions and moderation queues; versions and
their history. A pull request is the submission pipeline, and git history is
the version history. Each could return without changing a key or a file.
Workflow copy counts (Uses, Popular) live outside the model too: an
optional store the pages read at request time (`lib/usage/copies.ts`), never
a field in a file.
