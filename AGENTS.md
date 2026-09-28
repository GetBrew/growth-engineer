# Agent Guidelines — growth.engineer

Canonical instructions for coding agents and humans: the durable invariants
and the routing table into the deep-dive docs. CI caps it at 200 lines
(`pnpm docs:check`) — one canonical statement per policy, no changelog.

## What this is

An open-source catalog of **companies**, the **tools** they make, and
**workflows** that put tools to work. A COMPANY makes many TOOLS; a tool is
ONE function an agent can call (`apollo/enrich-person`), tied to a specific
MCP tool, CLI subcommand or API endpoint — not the product. A WORKFLOW is
several tools in order with the instructions that reach a result, and a growth
hack IS a workflow, not a second kind. **Every tool and workflow is ONE
generated markdown file any agent can run; copying it is the product action.**
Reads are public; agents fetch files with no sign-in.

**THE CATALOG IS THE REPOSITORY.** Every entry is a markdown file under
`companies/` and `workflows/`, plus the vocabulary in `tags.yml`; the site is
built from them, and the community contributes by pull request.

## Changing the catalog

Adding or fixing a company, tool, workflow or tag touches only `companies/`,
`workflows/` and `tags.yml`, then `pnpm content:check`. Start at
[`CONTRIBUTING.md`](CONTRIBUTING.md); every field is in the folder READMEs
([`companies/`](companies/README.md), [`workflows/`](workflows/README.md)),
and two skills do it end to end:
[`add-workflow`](.agents/skills/add-workflow/SKILL.md) and
[`research-company`](.agents/skills/research-company/SKILL.md). Never edit a
rendered file or the app to change a fact. The rest of this file is for
changing the site itself.

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · a build-time content
compiler (`lib/content/`) · Tailwind v4 · shadcn on Base UI · Biome · Vitest
· pnpm. **The catalog has no backend, no database and no auth provider**;
the one runtime store is an optional Upstash Redis counting workflow copies
(`lib/usage/copies.ts`: Uses, Hot, Popular). Every route is public; every
env var is optional (`.env.example`, read only through `lib/env.ts`).

## Validation — proportional, not ceremonial

- **While editing**: `pnpm exec biome check --write <all touched files>` once
  per unit of work, in ONE call (every invocation loads the whole project).
  Plus `pnpm test:run tests/<exact file>` for the behavior you touched.
- **Touched catalog data** (`companies/`, `workflows/`, `tags.yml`):
  `pnpm content:check` — every problem, with its file path.
- **Once per unit of work**: `pnpm check` (Biome + `tsgo`). Not per patch.
- **Final handoff**: `pnpm tsc` then `pnpm lint`. Touched the renderer: the
  goldens in `tests/render-markdown.test.ts` must still pass byte for byte.
- **Docs only**: `pnpm docs:check`.

Heavy commands (`check`, `tsc`, `build`, `test:run`, `knip`) queue through
`scripts/heavy-lock.mjs`, one at a time per repository; a lock timeout is a
queue timeout, not a failure. `content:check` is light and runs at once. Never call `vitest`, `tsc`,
`next build` or `knip` directly; dev servers are `pnpm dev`. What CI blocks
on: [`docs/maintainers/ci.md`](docs/maintainers/ci.md).

## Critical invariants

### The markdown file

- ONE render path: [`lib/catalog/render-markdown.ts`](lib/catalog/render-markdown.ts)
  (and `render-tag.ts` for tags; pure), called only by
  [`lib/content/build-documents.ts`](lib/content/build-documents.ts) at build time. Nothing renders on the request path; a rendered file is
  never hand-edited. A SOURCE file is a YAML header of facts; a company or
  workflow adds a markdown body (a tool file is its header alone): a
  workflow's inputs, steps and checks are body sections ([`lib/content/workflow-body.ts`](lib/content/workflow-body.ts));
  the build adds setup and rules.
- The format is the contract in [`docs/markdown-files.md`](docs/markdown-files.md):
  flat YAML header, setup picks the best way in (official MCP → CLI → API →
  community; tool files list every option, workflow files ≤ 2 per tool, each
  company's ways once), inputs in backticks, ≤ 10 steps, Rules last and
  immutable, tool ≈ 80 lines, workflow ≈ 200. Change the format and the
  golden fixtures in `tests/fixtures/markdown/` in the same commit.
- A rendered file's `updated` is the newest `updated` among the source files
  that fed it (tool ← company, workflows; workflow ← tools, their companies).

### Keys and refs

- Public identity is the `key` (`apollo`, `apollo/enrich-person`,
  `funding-signal-outbound`), and the key IS the path:
  `companies/apollo/`, `companies/apollo/tools/enrich-person.md`,
  `workflows/funding-signal-outbound.md` (FLAT — no folders; the workflow's
  `author` is a GitHub login in its header, never a company). Keys are never
  authored in a header.
  Grammar and reserved handles live in [`lib/catalog/keys.ts`](lib/catalog/keys.ts);
  every top-level route must be reserved (pinned by `tests/keys.test.ts`).
- Keys never change after publishing. A rename lists the old key under
  `aliases:`; every miss asks the alias map before answering 404, and the
  `.md` handler and the pages turn a hit into a real 308.
- Deprecated stays visible with a warning; a `draft` tool or workflow has no
  page, no file and no list; a published workflow uses published tools only.

### The content compiler

- `lib/content/read-tree.ts` is the only reader of the content tree (the OG
  font is `lib/seo/og-font.ts`); `buildCatalog(files)` is pure and testable.
- Every rule is enforced at build with the offending file's path, and every
  problem is reported at once (`ContentErrors`): strict schemas (unknown
  fields rejected), reserved handles, every step's tool resolves and is
  published, tags exist, aliases never shadow a live key, a published tool
  has ≥ 1 call on a declared way in and `docs:`, a tool file has no body,
  logos stay under 32 KB, files within their line caps. A new rule ships
  with a negative test in `tests/content-schema.test.ts` — a guard is not done until it has FAILED.
- Computed values (tags, `searchText`) come from `lib/content/derive.ts`;
  the links and tag counts from `lib/content/build-relations.ts`, read through
  `relationsOf` — one writer each, never authored in a file. The workflow ↔ tool relationship is
  written into BOTH rendered files (`tools:` / `workflows:`) and both pages.
- The pure half of `lib/catalog/*` (keys, renderer, search grammar) imports
  nothing from `node:`, `server-only` or `lib/content` — it runs in the proxy
  and the browser too (`tests/catalog-purity.test.ts`). Only `catalog.ts`,
  `loaders.ts`, `discovery.ts` and `static-params.ts` are server-side.

### Discovery: SEO, GEO and agents

- The words are defined ONCE, in `lib/catalog/definitions.ts`; `/llms.txt`,
  `/llms-full.txt` and the structured data read from it. Never restate a
  definition in a page or a doc — link or import.
- Every page's metadata comes from `pageMetadata()` (`lib/seo/metadata.ts`):
  a canonical path, Open Graph facts, and for a page that IS a file its
  `text/markdown` alternate. The card is the segment's `opengraph-image.tsx`,
  drawn at build (`generateStaticParams`, `next/og`). Structured data
  (`lib/seo/structured-data.ts`, rendered by `<JsonLd>`) restates facts
  already on the page — never new ones. `/sitemap.xml` lists every indexable
  page with its `updated` date. `/robots.txt`
  allows every crawler and names the AI crawlers. `tests/seo.test.tsx` holds
  the sitemap, `/llms.txt` and `/llms-full.txt` to the catalog exactly.

### Rendering and caching

- The catalog is built ONCE per process (`lib/catalog/catalog.ts`) from
  synchronous reads, so every page, the `.md` handler and `/llms.txt`
  PRERENDER with no `'use cache'` and no `connection()`; detail routes list
  params with `generateStaticParams` (`lib/catalog/static-params.ts`). Never
  `export const dynamic`, `revalidate` or `dynamicParams`. The ONE `'use cache'`
  is the copy counts (+ `connection()`, streamed into `<Suspense>` holes); the
  header's star count is inlined at build (`next.config.ts`), never fetched.
- EVERY page and permutation is generated at build. Listings prerender every
  item with no query and, once hydrated (`useIsClient`), narrow themselves
  from the URL (`useSearchParams`; pure search in `lib/catalog/search.ts`).
  No page reads `searchParams` on the server.
  The dynamic routes are `/mcp` and the copy counter's POST
  (`/api/workflows/<name>/copies`); the proxy runs only for `.md` files
  and `Accept: text/markdown`. A detail page says `export const instant = false`.
- NOTHING LOADS: no skeletons, no spinners, no fetch after load, no
  `<Suspense>` in a page but a copy-count hole. A page renders directly; one with
  params awaits them itself: every known key is in `generateStaticParams`,
  so its HTML is complete and inline. Only an unknown key renders on demand.
- Internal navigation is ALWAYS `next/link` (never a raw `<a href="/…">`):
  Link prefetches on viewport and on hover, and every target is static, so a
  navigation is a cached fetch. Raw anchors are for external URLs and for
  files a route handler serves (`/llms.txt`, `.md`), which are not pages.
- Route handlers never read `request.url`: a redirect is a relative
  `Location` on a 308, or the route silently goes dynamic.
- A redirect is never a page: decided in a Suspense child it becomes a
  `<meta refresh>` agents ignore. A redirect-only URL is a route handler
  (`/tools/[handle]`).
- Filters and search are LINKS and GET forms (`next/form`) — the URL is the
  state; an agent can use the same URL.

### Testing

- `tests/` runs in `node`; the suite is hermetic on a fresh clone. The
  content suite (`tests/content.test.ts`) builds the real tree and asks every
  question a page asks; extend it when you add a read.
- Write the negative cases. A guard is not done until it has FAILED.

## Code conventions

- Tailwind: `flex gap-*`, never `space-x/y-*`; `flex-1` pairs with `min-w-0`.
- File size target ~200 lines, cap 400 (data tables exempt).
- One concern per file; name files by what they render; `Array<T>`; booleans
  take `is/has/should/can`; environment through `lib/env.ts`.
- Icons from `@hugeicons/react` + `@hugeicons/core-free-icons`; Geist Sans
  and Geist Mono through `next/font`.
- Nothing invented in the catalog or the UI: no placeholder facts, fake stats,
  invented users, commands or endpoints (the home page's illustrated avatars
  are decoration). Hide a slot when data is absent.

## Documentation hygiene

A change that moves a boundary updates the closest README or this file in the
same batch; `pnpm docs:check` fails on a broken link or this file over cap.

## Docs routing table

| Topic | Doc |
| --- | --- |
| Product vision, phases, what is not in v1 | [`docs/vision.md`](docs/vision.md) |
| What the build derives and every rule it enforces | [`docs/data-model.md`](docs/data-model.md) |
| The rendered markdown file contract and where files are served | [`docs/markdown-files.md`](docs/markdown-files.md) |
| Request path, the build-time catalog, search, layout | [`docs/architecture.md`](docs/architecture.md) |
| First run and deploying | [`docs/setup.md`](docs/setup.md) |
| Validation, the heavy lock, dev servers, worktrees | [`docs/maintainers/validation.md`](docs/maintainers/validation.md) |
| CI jobs and why each exists | [`docs/maintainers/ci.md`](docs/maintainers/ci.md) |
| Cache Components, bundle budget, Turbopack | [`docs/maintainers/performance.md`](docs/maintainers/performance.md) |
