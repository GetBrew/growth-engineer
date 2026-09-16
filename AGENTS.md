# Agent Guidelines

Canonical instructions for coding agents (Claude, Codex, Cursor, Copilot) and
for humans. This file holds the durable invariants and the routing table into
the deep-dive docs. CI caps it at 200 lines (`pnpm docs:check`) — keep it
pointer-style: one canonical statement per policy, no history, no changelog.

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · Convex · Clerk ·
Tailwind v4 · Biome · Vitest · pnpm.

## Validation — proportional, not ceremonial

Run the smallest check that can find the mistake you just made.

- **While editing**: `pnpm exec biome check --write <all touched files>` once
  per unit of work, in ONE call — every invocation loads the whole project
  layer no matter how many files you pass, so batch them and never call it per
  file. Plus `pnpm test:run tests/<exact file>` for the behavior you touched —
  a filter makes it the fast inner loop rather than the whole suite.
- **Once per unit of work**: `pnpm check` (Biome + the fast `tsgo` typecheck).
  Not after every patch.
- **Once, at final handoff for code changes**: `pnpm tsc` then `pnpm lint`,
  sequentially. Never submit work that breaks typecheck, lint, or the tests
  that cover what you touched.
- **Docs-only changes**: `pnpm docs:check`.
- **Convex changes**: `pnpm test:convex` — its authorization tests are the
  point of the suite.

### Serialized commands

`pnpm check`, `pnpm tsc`, `build`, `test:run`, `test:convex` and `knip` run
under `scripts/heavy-lock.mjs` — ONE at a time per repository, across all git
worktrees. Each loads the whole project (gigabytes); two at once is swap and
three is an OOM kill that reads like a mysterious test failure. A lock timeout
is a QUEUE timeout, not a check failure, and the message names the holder.

Never call the underlying binary directly (`vitest`, `tsc`, `next build`,
`knip`) — that is the bypass the lock exists to prevent. `pnpm test:run` takes
a file filter, so the inner loop needs no escape hatch.

`pnpm tsc` takes an optional program name — `pnpm tsc app`, or `tests`,
`scripts`, `convex`, `convex:tests` — and runs all five with no argument.
`scripts/typecheck.mjs` owns that list; there is no per-program package script
to keep in sync.

**Dev servers**: start one with `pnpm dev`, never `npx next dev` — the wrapper
prunes the Turbopack cache, caps the heap, and reaps the detached telemetry
flusher Next leaves behind on every shutdown (a few hundred MB per stopped
server, parented to init, forever). Stop what you start.

### What CI blocks on

More than `tsc`. Every pull request runs: `pnpm lint` (Biome — also the
formatting gate and the import-cycle gate), five typecheck programs as parallel
matrix legs, `pnpm build` plus the client bundle budget, the unit and Convex
test suites, and the hygiene job (`docs:check`, Convex codegen freshness,
`knip`, duplicate dependencies). Details: [`docs/ci.md`](docs/ci.md).

## Critical invariants

### Cache Components

`cacheComponents: true` is on. Every route gets a prerendered static shell.

- A page's default export is SYNCHRONOUS and returns a `<Suspense>` boundary.
  Every request-time read — `auth()`, `cookies()`, `headers()`, `params`,
  `searchParams`, a Convex query — lives inside the async child. Canonical
  pattern: [`app/(app)/dashboard/page.tsx`](<app/(app)/dashboard/page.tsx>).
- `await` anything at the top of an async page and the whole route drops out of
  the prerender. `next dev` flags it as a blocking route.
- NEVER `export const dynamic = 'force-dynamic'`. Use `Cache-Control:
  no-store` or the Next 16 cache model.
- A Suspense fallback must be dimensionally stable — same box as the real
  content — or the page lands and then jumps.

### Convex authorization

- **Every public Convex function is built with a tier builder** from
  [`convex/shared/builders.ts`](convex/shared/builders.ts): `publicQuery`,
  `authenticatedQuery/Mutation`, `orgMemberQuery/Mutation`,
  `orgAdminMutation`, `serviceMutation`. The builder runs the guard
  before the handler is entered, so it cannot be skipped. Pinned by
  `tests/convex-builders.test.ts`.
- **The handler never reads a caller-supplied identity.** The builder declares
  AND CONSUMES the transport args (`serviceToken`, `actingUserId`,
  `actingOrgId`, `actingOrgRole`); read the verified actor from `ctx.actor`.
  Never re-declare a consumed arg — a shadowing declaration hands the handler
  an unverified value under a name that reads exactly like the verified one.
- **An id is not a claim.** Re-check ownership on the row itself for every
  id-addressed read or write, and answer "not yours" as NOT_FOUND so ids
  cannot be enumerated.
- **Server callers go through the gateway.** Every server-side Convex call uses
  [`lib/convex/gateway.ts`](lib/convex/gateway.ts) — `tenantQuery`/
  `tenantMutation` when a verified human acts, `systemQuery`/`systemMutation`
  for machines. `convex/nextjs` is banned elsewhere (Biome
  `noRestrictedImports`); the transport args are optional at the wire, so a
  hand-threaded token that goes missing is invisible to `tsc` and throws only
  at runtime.
- **Client callers gate on auth.** Identity-scoped `useQuery` goes through
  `useAuthedQuery` ([`hooks/use-authed-query.ts`](hooks/use-authed-query.ts))
  — the Clerk JWT
  attaches to the socket asynchronously after mount. Pinned by
  `tests/convex-client-auth-gating.test.ts`.
- **Errors are typed.** User-facing Convex functions throw `ConvexError` app
  errors ([`convex/shared/errors.ts`](convex/shared/errors.ts)) — never a plain
  `Error`, a silent no-op, or `{ success: false }`. Callers decode with
  `getAppErrorMessage(error, fallback)`.

### Convex data

- `convex/schema.ts` is the single stable `defineSchema(...)` default export.
- Every field you filter or sort on belongs in an INDEX. Read with
  `.withIndex(...)`; `.filter(...)` is a table scan wearing a predicate.
- Bound every read: `.take(n)`, not `.collect()`. A table that is small in
  development is a 16 MB read limit in production.
- Module filenames under `convex/` use letters, numbers, underscores and
  periods only — the CLI rejects hyphens.
- Build-time Convex reads hit the PREVIOUS deployment's functions (production
  builds push functions after the build succeeds). A prerendered page must not
  hard-depend on a signature introduced in the same commit.
- Adding or renaming a module means committing regenerated
  `convex/_generated` — `pnpm convex:codegen:check` catches the drift.

### Testing

- Tests live in `tests/`, run in the cheap `node` environment; a file opts into
  a DOM with a `// @vitest-environment jsdom` docblock.
- Convex FUNCTION tests are the one exception — `convex-test` needs an
  `import.meta.glob` beside `convex/`, so they live at `convex/**/*.test.ts`
  and run via `pnpm test:convex`.
- `.env.test` (committed, non-secret) is what makes a fresh clone hermetic:
  the suite is green with no credentials at all. Add a variable there only when
  a test fails without it; never add a real secret.
- **A guard is not done until it has FAILED.** Delete the thing it protects and
  watch it go red before you trust a new test.
- Write the negative cases. The happy path is what you would notice broken in
  five seconds of clicking; "anonymous caller refused" and "one user cannot
  touch another's row" are what ship quietly.

## Code conventions

- **Tailwind**: never `space-x-*` / `space-y-*` — use `flex gap-*`. Pair
  `flex-1` with `min-w-0` (horizontal) or `min-h-0` (vertical).
- **File size**: target ~200 lines, hard cap 400 (Biome
  `noExcessiveLinesPerFile`). Split the file rather than adding an override.
- **One concern per file.** Shared types in `types.ts`, pure utilities in
  `utils.ts` separate from React components. Name files by what they render
  (`task-list.tsx`, not `list-renderer.tsx`).
- **Booleans** take an `is`/`has`/`should`/`can` prefix.
- **`Array<T>`**, not `T[]` (enforced).
- Extract multi-line function props into named functions or `useCallback`;
  one-liner references stay inline.
- **Environment access** goes through [`lib/env.ts`](lib/env.ts), never a bare
  `process.env.FOO!` at a call site.

## Documentation hygiene

When a change moves a module boundary, update the closest README or this file
in the same batch. `pnpm docs:check` fails on a broken relative link and on an
AGENTS.md over its line cap.

## Docs routing table

| Topic | Doc |
| --- | --- |
| First-run setup: Convex deployment, Clerk JWT template, webhooks | [`docs/setup.md`](docs/setup.md) |
| Architecture: the request path, where each decision lives | [`docs/architecture.md`](docs/architecture.md) |
| Validation, the heavy lock, dev servers, worktrees | [`docs/validation.md`](docs/validation.md) |
| CI: what each job proves and why it is shaped that way | [`docs/ci.md`](docs/ci.md) |
| Performance: Cache Components, bundle budgets, Turbopack | [`docs/performance.md`](docs/performance.md) |
| Adding a second app (microfrontends, admin surfaces) | [`docs/microfrontends.md`](docs/microfrontends.md) |
