# next-convex-clerk-starter

A Next.js 16 + Convex + Clerk starter that carries the parts you normally add
in year two: authorization that cannot be forgotten, a test suite that runs on
a fresh clone with no credentials, and CI that blocks on more than `tsc`.

Small on purpose — one example table, one example page. The value is in the
wiring.

```bash
pnpm install
cp .env.example .env.local
npx convex dev          # in one terminal
pnpm dev                # in another
```

Full first-run, including the Clerk JWT template that everything depends on:
**[`docs/setup.md`](docs/setup.md)**.

## What is in the box

**Authorization by construction.** Every Convex function is built with a
tier-named builder (`authenticatedQuery`, `orgMemberQuery`,
`orgAdminMutation`, `serviceMutation`). The guard runs before the handler is
entered, and the builder CONSUMES the caller's identity args — so a handler
cannot read a caller-supplied `orgId` even by accident. Cross-tenant access
stops being a mistake you can make.
→ [`docs/architecture.md`](docs/architecture.md)

**Cache Components, wired correctly.** Pages are synchronous shells around a
`<Suspense>`; request-time reads live in the async child. `next dev` flags a
route that breaks the rule.
→ [`docs/performance.md`](docs/performance.md)

**A hermetic test suite.** `.env.test` is committed and non-secret, so
`pnpm test:run` is green on a fresh clone with no credentials — CI runners and
cloud agents need zero setup. The Convex tests assert the NEGATIVE cases:
anonymous refused, one user cannot touch another's row.

**CI that blocks on what matters.** Lint (including import cycles), five
typecheck programs in parallel, a real production build on the pull request,
both test suites, and a hygiene job covering doc links, Convex codegen
freshness, dead code and duplicate dependencies.
→ [`docs/ci.md`](docs/ci.md)

**A client bundle ratchet.** Each route's client JavaScript may grow 5% or
15 KB, whichever is smaller, before CI says so. Re-baselining is deliberate and
reviewed.

**A dev loop that survives several worktrees and a coding agent.** Heavy
commands serialize through one lock per repository; `pnpm dev` prunes the
Turbopack cache and reaps the detached telemetry flusher Next leaves behind on
every shutdown.
→ [`docs/validation.md`](docs/validation.md)

**Agent-ready.** [`AGENTS.md`](AGENTS.md) holds the invariants in the form an
agent can follow, capped at 200 lines by CI so it stays a policy file and does
not rot into a changelog.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server (cache prune, heap cap, flusher reap) |
| `pnpm dev:convex` | Convex dev, watching `convex/` |
| `pnpm check` | Biome + fast typecheck — once per unit of work |
| `pnpm tsc` / `pnpm lint` | The full gate, at handoff |
| `pnpm tsc app` | One TypeScript program (`app`, `tests`, `scripts`, `convex`, `convex:tests`) |
| `pnpm test:run` / `pnpm test:convex` | Unit suite / Convex function suite |
| `pnpm test:run tests/x.test.ts` | One test file — the inner loop |
| `pnpm validate` | Everything, in order |
| `pnpm build` | Production build (Turbopack) |
| `pnpm perf:bundle` | Client bundle budget, after a build |
| `pnpm hygiene` | Docs, codegen freshness, knip, duplicate deps |

## Layout

```
app/
  (marketing)/         public, fully static
  (app)/               signed in — the proxy gates the group
  api/                 health probe, Clerk webhook
convex/
  schema.ts            tables + the indexes their reads need
  shared/builders.ts   the tier-named function builders
  shared/auth.ts       the reviewed guards they delegate to
  shared/errors.ts     typed ConvexError payloads
  tasks.ts             worked example — copy its shape
  tasks.test.ts        authorization tests, both directions
lib/
  auth/routes.ts       THE route policy (default deny)
  convex/gateway.ts    the only server-side Convex transport
  env.ts               validated environment access
hooks/
  use-authed-query.ts  client reads that wait for the JWT
scripts/               dev wrapper, heavy lock, typecheck, CI gates
docs/                  the deep dives AGENTS.md routes to
```

## Making it yours

1. Rename the project in `package.json` and `vercel.json`.
2. Replace `convex/tasks.ts` and the `tasks` table with your domain — keep the
   shape.
3. Add routes under `app/(app)/`; they are protected by the proxy's default
   deny the moment they exist.
4. Snapshot your bundle budget once you have real routes:
   `pnpm build && pnpm perf:bundle:snapshot`.
5. Keep `AGENTS.md` current. It is the file every agent reads first.
