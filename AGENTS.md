# Agent Guidelines — growth.engineer

Canonical instructions for coding agents (Claude, Codex, Cursor, Copilot) and
for humans. This file holds the durable invariants and the routing table into
the deep-dive docs. CI caps it at 200 lines (`pnpm docs:check`) — keep it
pointer-style: one canonical statement per policy, no history, no changelog.

## What this is

An open-source catalog of **companies**, the **tools** they make, and
**workflows** that put tools to work. A COMPANY makes many TOOLS; a tool is
ONE function an agent can call (`clay/enrich-contacts`), tied to a specific
MCP tool, CLI subcommand or API endpoint — not the product. A WORKFLOW is
several tools in order with the instructions that reach a result, and a growth
hack IS a workflow, not a second kind. **Every tool and workflow is ONE
generated markdown file any agent can run; copying it is the product action.**
Reads are public; agents fetch files with no sign-in.

**THE CATALOG IS THE REPOSITORY.** Every entry is a markdown file under
`companies/`, `workflows/` and `tags/`; the site is built from them, and
the community contributes by pull request. To add or change catalog data,
read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the folder READMEs
([`companies/`](companies/README.md), [`workflows/`](workflows/README.md),
[`tags/`](tags/README.md)); never edit a rendered file or the app to change
a fact. Vision: [`docs/vision.md`](docs/vision.md). File schema:
[`docs/data-model.md`](docs/data-model.md).

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · a build-time content
compiler (`lib/content/`) · Tailwind v4 · shadcn on Base UI · Biome · Vitest
· pnpm. **There is no backend, no database and no auth provider.** Every
route is public; the only environment is two optional `NEXT_PUBLIC_*` values.

## Validation — proportional, not ceremonial

- **While editing**: `pnpm exec biome check --write <all touched files>` once
  per unit of work, in ONE call (every invocation loads the whole project).
  Plus `pnpm test:run tests/<exact file>` for the behavior you touched.
- **Touched catalog data** (`companies/`, `workflows/`, `tags/`):
  `pnpm content:check` — every problem, with its file path.
- **Once per unit of work**: `pnpm check` (Biome + `tsgo`). Not per patch.
- **Final handoff**: `pnpm tsc` then `pnpm lint`. Touched the renderer: the
  goldens in `tests/render-markdown.test.ts` must still pass byte for byte.
- **Docs only**: `pnpm docs:check`.

### Serialized commands

`pnpm check`, `pnpm tsc`, `build`, `test:run`, `content:check`, `knip` run
under `scripts/heavy-lock.mjs` — one at a time per repository across all
worktrees. A lock timeout is a QUEUE timeout, not a check failure. Never call
the underlying binary (`vitest`, `tsc`, `next build`, `knip`) directly. Dev
servers: `pnpm dev`, never `npx next dev`. `pnpm tsc <program>` runs one of
`app`, `tests`, `scripts`.

### What CI blocks on

Lint (Biome — formatting and import cycles too), three typecheck programs in
parallel, `pnpm build` plus the client bundle ratchet, the unit suite (which
includes the content suite), and hygiene (`docs:check`, `content:check`,
`knip`, duplicate deps). [`docs/ci.md`](docs/ci.md).

## Critical invariants

### The markdown file

- ONE render path: [`lib/catalog/render-markdown.ts`](lib/catalog/render-markdown.ts)
  (pure) called only by [`lib/content/build-documents.ts`](lib/content/build-documents.ts)
  at build time. Nothing renders on the request path; a rendered file is
  never hand-edited; the SOURCE files under `companies/` and `workflows/`
  are structured input, not the product.
- The format is the contract in [`docs/markdown-files.md`](docs/markdown-files.md):
  flat YAML header, setup picks the best way in (official MCP → CLI → API →
  community; tool files list every option, workflow files ≤ 2 per tool or the
  step's `via`), inputs in backticks, ≤ 10 steps, Rules last and immutable,
  tool ≈ 60 lines, workflow ≈ 120. Change the format and the golden fixtures
  in `tests/fixtures/markdown/` in the same commit.
- A file's `updated` date is the newest of its inputs: a workflow file
  changes when a tool it uses changes its way in.

### Keys and refs

- Public identity is the `key` (`clay`, `clay/enrich-contacts`,
  `brew/intent-to-meeting`, `@3` pins a version), and the key IS the path:
  `companies/clay/`, `companies/clay/tools/enrich-contacts.md`,
  `workflows/brew/intent-to-meeting.md`. Keys are never authored in a header.
  Grammar and reserved handles live in [`lib/catalog/keys.ts`](lib/catalog/keys.ts);
  every top-level route must be reserved (pinned by `tests/keys.test.ts`).
- Keys never change after publishing. A rename lists the old key under
  `aliases:`; every miss asks the alias map before answering 404, and the
  `.md` handler and the pages turn a hit into a real 308.
- Deprecated stays visible with a warning; a `draft` tool (no way in yet) has
  no page, no file and no place in any list.

### The content compiler

- `lib/content/read-tree.ts` is the ONLY module that touches the filesystem;
  `buildCatalog(files)` is pure and testable with in-memory fixtures.
- Every rule is enforced at build with the offending file's path, and every
  problem is reported at once (`ContentErrors`): strict schemas (unknown
  fields rejected), reserved handles, every step's tool resolves and is
  published, `via` names a way in the tool has, tags exist, aliases never
  shadow a live key, a published tool has ≥ 1 way in, logos exist. A new rule
  ships with a negative test in `tests/content-schema.test.ts` — a guard is
  not done until it has FAILED.
- PROJECTIONS (`agentLevel`, `has:*`/`agent:*` tags, tag counts, `searchText`,
  `toolCount`, the edges) are computed in `lib/content/derive.ts` and
  `build-catalog.ts` — one writer each, never authored in a file.
- The pure half of `lib/catalog/*` (keys, agent-level, renderer, search
  grammar, types) imports nothing from `node:`, `server-only` or
  `lib/content` — it runs in the proxy and the browser too
  (`tests/catalog-purity.test.ts`). Only `catalog.ts`, `loaders.ts` and
  `static-params.ts` are server-side.

### Rendering and caching

- The catalog is built ONCE per process (`lib/catalog/catalog.ts`) from
  synchronous reads, so every catalog page, the `.md` handler and `/llms.txt`
  PRERENDER at build with no `'use cache'` and no `connection()`. Detail
  routes list their params with `generateStaticParams`
  (`lib/catalog/static-params.ts`). Never `export const dynamic`,
  `revalidate` or `dynamicParams` — Cache Components rejects them.
- A page's default export is SYNCHRONOUS and returns a `<Suspense>`; the only
  request-time reads are `searchParams` (`/tools`, `/companies`, `/workflows`,
  `/map`), inside the async child. Those routes read the tree at request
  time, which is why `next.config.ts` traces `companies/`, `workflows/` and
  `tags/` into every function bundle.
- Route handlers never read `request.url`: a redirect is a relative
  `Location` on a 308, or the route silently goes dynamic.
- A redirect is never a page: decided in a Suspense child it becomes a
  `<meta refresh>` agents ignore. A redirect-only URL is a route handler
  (`/tools/[handle]`).
- Fallbacks are dimensionally stable. Filters and search are LINKS and GET
  forms — the URL is the state; an agent can use the same URL.

### Testing

- `tests/` runs in `node`; the suite is hermetic on a fresh clone. The
  content suite (`tests/content.test.ts`) builds the real tree and asks every
  question a page asks; extend it when you add a read.
- Write the negative cases. A guard is not done until it has FAILED.
- Every seeded tool is `agent: unverified` because nobody has checked the
  facts; `agent.checked` in a tool file is the only thing that changes that.

## Code conventions

- Tailwind: `flex gap-*`, never `space-x/y-*`; `flex-1` pairs with `min-w-0`.
- File size target ~200 lines, cap 400 (data tables exempt).
- One concern per file; name files by what they render; `Array<T>`; booleans
  take `is/has/should/can`; environment through `lib/env.ts`.
- Icons from `@hugeicons/react` + `@hugeicons/core-free-icons`; Geist Sans
  and Geist Mono through `next/font`.
- Nothing invented in the catalog or the UI: no placeholder facts, fake
  stats, invented customers or testimonials. Hide a slot when data is absent.

## Documentation hygiene

A change that moves a boundary updates the closest README or this file in the
same batch. `pnpm docs:check` fails on a broken link or this file over cap.

## Docs routing table

| Topic | Doc |
| --- | --- |
| Adding a company, tool, workflow or tag | [`CONTRIBUTING.md`](CONTRIBUTING.md), [`companies/README.md`](companies/README.md), [`workflows/README.md`](workflows/README.md), [`tags/README.md`](tags/README.md) |
| Product vision, phases, what is not in v1 | [`docs/vision.md`](docs/vision.md) |
| The file schema: every field, every rule, the projections | [`docs/data-model.md`](docs/data-model.md) |
| The rendered markdown file contract and where files are served | [`docs/markdown-files.md`](docs/markdown-files.md) |
| Request path, the build-time catalog, search, layout | [`docs/architecture.md`](docs/architecture.md) |
| First run and deploying | [`docs/setup.md`](docs/setup.md) |
| Validation, the heavy lock, dev servers, worktrees | [`docs/validation.md`](docs/validation.md) |
| CI jobs and why each exists | [`docs/ci.md`](docs/ci.md) |
| Cache Components, bundle budget, Turbopack | [`docs/performance.md`](docs/performance.md) |
| Adding a second app | [`docs/microfrontends.md`](docs/microfrontends.md) |
