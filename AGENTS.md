# Agent Guidelines — growth.engineer

Canonical instructions for coding agents (Claude, Codex, Cursor, Copilot) and
for humans. This file holds the durable invariants and the routing table into
the deep-dive docs. CI caps it at 200 lines (`pnpm docs:check`) — keep it
pointer-style: one canonical statement per policy, no history, no changelog.

## What this is

A catalog of **companies**, the **tools** they make, and **workflows** that
put tools to work (a growth hack is a one-tool workflow). **Every tool and
workflow is ONE generated markdown file any agent can run; copying it is the
product action.** Reads are public; agents fetch files with no sign-in.
Vision: [`docs/vision.md`](docs/vision.md). Model: [`docs/data-model.md`](docs/data-model.md).

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · Convex · Clerk ·
Tailwind v4 · Biome · Vitest · pnpm. Generated from
`GetBrew/next-convex-clerk-starter`.

## Validation — proportional, not ceremonial

- **While editing**: `pnpm exec biome check --write <all touched files>` once
  per unit of work, in ONE call (every invocation loads the whole project).
  Plus `pnpm test:run tests/<exact file>` for the behavior you touched.
- **Once per unit of work**: `pnpm check` (Biome + `tsgo`). Not per patch.
- **Final handoff**: `pnpm tsc` then `pnpm lint`. Touched `convex/`: also
  `pnpm test:convex`. Touched the renderer: the goldens in
  `tests/render-markdown.test.ts` must still pass byte for byte.
- **Docs only**: `pnpm docs:check`.

### Serialized commands

`pnpm check`, `pnpm tsc`, `build`, `test:run`, `test:convex`, `knip` run under
`scripts/heavy-lock.mjs` — one at a time per repository across all worktrees.
A lock timeout is a QUEUE timeout, not a check failure. Never call the
underlying binary (`vitest`, `tsc`, `next build`, `knip`) directly. Dev
servers: `pnpm dev`, never `npx next dev`. `pnpm tsc <program>` runs one of
`app`, `tests`, `scripts`, `convex`, `convex:tests`.

### What CI blocks on

Lint (Biome — formatting and import cycles too), five typecheck programs in
parallel, `pnpm build` with placeholder env plus the client bundle ratchet,
the unit and Convex suites, and hygiene (`docs:check`, Convex codegen
freshness, `knip`, duplicate deps). [`docs/ci.md`](docs/ci.md).

## Critical invariants

### The markdown file

- ONE render path: [`convex/model/render_markdown.ts`](convex/model/render_markdown.ts)
  (pure) called only by [`convex/documents_render.ts`](convex/documents_render.ts),
  which writes the `documents` table. Nothing else writes `documents.markdown`;
  nothing renders on the request path; a file is never hand-edited.
- The format is the contract in [`docs/markdown-files.md`](docs/markdown-files.md):
  flat YAML header, setup picks the best way in (official MCP → CLI → API →
  community; tool files list every option, workflow files ≤ 2 per tool or the
  step's `via`), inputs in backticks, ≤ 10 steps, Rules last and immutable,
  tool ≈ 60 lines, workflow ≈ 120. Change the format and the golden fixtures
  in `tests/fixtures/markdown/` in the same commit.
- An unchanged file is not rewritten (`hash`): a write re-runs every live
  query that read the row.

### Keys and refs

- Public identity is the `key` (`clay`, `clay/clay`, `brew/intent-to-meeting`,
  `@3` pins a version); stored references are ALWAYS internal ids; a key is
  resolved once at the edge via `by_key`. Grammar and reserved handles live in
  [`convex/model/keys.ts`](convex/model/keys.ts); every top-level route must
  be reserved (pinned by `tests/keys.test.ts`).
- Keys never change after publishing. A rename adds a `keyAliases` row;
  every `by_key` miss asks `aliases.resolve` before answering 404, and the
  `.md` handler turns a hit into a real 308.
- Deprecated stays visible with a warning; archived is hidden. A
  `moderation: 'pending'` workflow is live at its link and absent from lists.

### Convex authorization

- **Every public function is built with a tier builder** from
  [`convex/shared/builders.ts`](convex/shared/builders.ts): `publicQuery` for
  the catalog, `authenticatedQuery/Mutation`, `orgMemberQuery/Mutation`,
  `orgAdminMutation`, `serviceMutation`. The guard runs before the handler;
  the handler reads `ctx.actor`, never a caller-supplied id.
- `internalMutation` appears ONLY in `convex/seed/run.ts` and
  `convex/documents.ts` (`tests/convex-internal-builders.test.ts`).
- **A route's authority lives in the route**, never in the proxy's matcher
  alone: every `/api/*` handler authenticates itself and `/submit` calls
  `auth.protect()`. `proxy.ts` is the fast 307, and Clerk has deprecated
  matcher-only gating.
- **Server callers go through the gateway**
  ([`lib/convex/gateway.ts`](lib/convex/gateway.ts)): `publicQuery` for the
  catalog (no identity), `tenant*` when a verified human acts, `system*` for
  machines. `convex/nextjs` is banned elsewhere.
- `convex/model/*` is PURE — no runtime import of `convex/*`,
  `_generated/server`, `shared/*`, `node:*` or `server-only` — because Next
  bundles it too (`tests/convex-model-purity.test.ts`).

### Convex data

- `convex/schema.ts` is v0.3.1 of the design doc, verbatim plus `auth.header`
  and the `by_format_top` / `by_format_new` listing indexes. Keep it the
  single `defineSchema` export.
- Every read uses an index and is bounded (`.take(n)`); `.filter(...)` is a
  scan. Every list is paged. Joins are parallel point reads (`getMany` in
  [`convex/shared/reads.ts`](convex/shared/reads.ts)) — never an `await` in a loop.
- PROJECTION fields (`searchText`, `agentLevel`, `listed`, `format`,
  `toolCount`, `taggings.*`, `tags.counts`, `workflowTools`) are rewritten by
  one helper or a scheduled batch — never by hand in a second place.
- Hot counters never touch catalog documents: views/copies go to `events` and
  roll up into `entityStats`.
- Arrays stay short (access entries, steps); anything unbounded is a table.
- Module filenames under `convex/` use letters, digits, underscores, periods.
- Build-time reads hit the PREVIOUS deployment: a prerendered page must not
  hard-depend on a function introduced in the same commit.

### Rendering and caching

- A page's default export is SYNCHRONOUS and returns a `<Suspense>`; every
  request-time read (`params`, `searchParams`, `connection()`, a Convex query)
  lives in the async child. Never `export const dynamic = 'force-dynamic'`.
  A redirect is therefore never a page: decided in a Suspense child it becomes
  a `<meta refresh>` that agents ignore, and an async shell cannot prerender
  at all. A redirect-only URL is a route handler (`/tools/[handle]`).
- The contract in [`lib/catalog/loaders.ts`](lib/catalog/loaders.ts):
  per-key loaders are `'use cache: remote'` + `cacheTag(ref)`; list pages
  `await connection()` first so a build never contacts Convex; search is
  never cached; **no loader catches** — errors leave the cached scope and
  `error.tsx` renders them, so an outage is never cached as an empty catalog.
- `revalidateTag(ref, 'max')` through `POST /api/revalidate` purges a page
  and its `.md` file together.
- Fallbacks are dimensionally stable. Filters and search are LINKS and GET
  forms — the URL is the state; an agent can use the same URL.

### Testing

- `tests/` runs in `node`; `convex/**/*.test.ts` runs through `convex-test`
  (`pnpm test:convex`). `.env.test` is committed and non-secret; the
  suite is green on a fresh clone.
- Write the negative cases. A guard is not done until it has FAILED.
- The seed (`convex/seed/`) is the first caller of every read and is tested
  end to end; it is idempotent and illustrative, and every seeded tool is
  `agent: unverified` because nobody has checked the facts.

## Code conventions

- Tailwind: `flex gap-*`, never `space-x/y-*`; `flex-1` pairs with `min-w-0`.
- File size target ~200 lines, cap 400 (data tables and the schema exempt).
- One concern per file; name files by what they render; `Array<T>`; booleans
  take `is/has/should/can`; environment through `lib/env.ts`.
- Icons from `lucide-react`; the vendored orb stays byte-identical.

## Documentation hygiene

A change that moves a boundary updates the closest README or this file in the
same batch. `pnpm docs:check` fails on a broken link or this file over cap.

## Docs routing table

| Topic | Doc |
| --- | --- |
| Product vision, phases, what is not in v1 | [`docs/vision.md`](docs/vision.md) |
| Data model: keys, entities, access, tags, ranking, scaling | [`docs/data-model.md`](docs/data-model.md) |
| The markdown file contract and where files are served | [`docs/markdown-files.md`](docs/markdown-files.md) |
| Request path, caching contract, search plan, layout | [`docs/architecture.md`](docs/architecture.md) |
| First run: Convex, service token, seed, Clerk, Vercel | [`docs/setup.md`](docs/setup.md) |
| Validation, the heavy lock, dev servers, worktrees | [`docs/validation.md`](docs/validation.md) |
| CI jobs and why each exists | [`docs/ci.md`](docs/ci.md) |
| Cache Components, bundle budget, Turbopack | [`docs/performance.md`](docs/performance.md) |
| Adding the admin app as a second project | [`docs/microfrontends.md`](docs/microfrontends.md) |
| Convex module rules and file map | [`convex/README.md`](convex/README.md) |
