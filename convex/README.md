# convex/

The backend: the data model (`schema.ts`, v0.3.1), the public reads, the one
render path, and the seed.

## Rules

1. **Every public function uses a tier builder** from
   [`shared/builders.ts`](shared/builders.ts): `publicQuery` for the catalog,
   `serviceMutation` for machine writes, the `authenticated*` / `org*` tiers
   for signed-in surfaces. Never import `query` / `mutation` from
   `_generated/server` (`tests/convex-builders.test.ts`).
2. **`internalMutation` lives in `seed/run.ts` and `documents.ts` only**
   (`tests/convex-internal-builders.test.ts`).
3. **`model/*` is pure** — no runtime `convex/*`, `_generated/server`,
   `shared/*`, `node:*` or `server-only` imports — because Next bundles it
   (`tests/convex-model-purity.test.ts`).
4. **Read from an index, bound every read** (`.withIndex`, `.take(n)`), and
   resolve a key once through `by_key`. `.filter(...)` is a table scan.
5. **Projection fields have one writer.** `searchText`, `agentLevel`,
   `listed`, `format`, `toolCount`, `taggings.*`, `tags.counts` and
   `workflowTools` are rewritten by the helper that owns them (today: the
   seed), never patched ad hoc.
6. **Nothing but `documents_render.ts` writes a file.** A changed tool marks
   its dependents stale; `documents.renderStale` re-renders in bounded batches.
7. **Throw typed errors** from [`shared/errors.ts`](shared/errors.ts).
8. **Filenames** use letters, digits, underscores and periods — the CLI
   rejects hyphens.

## Files

| File | Purpose |
| --- | --- |
| `schema.ts` | the data model — `docs/data-model.md` |
| `model/keys.ts` | key grammar, refs, reserved handles, file paths |
| `model/agent_level.ts` | the agent-readiness rules table |
| `model/render_markdown.ts`, `model/render_access.ts`, `model/hash.ts` | THE renderer — `docs/markdown-files.md` |
| `companies.ts`, `tools.ts`, `workflows.ts`, `tags.ts`, `documents.ts`, `aliases.ts` | public reads (`tools.search` is the one search entry point) |
| `tools_search.ts` | the search query plan behind `tools.search` — `docs/architecture.md` |
| `documents_render.ts` | the one render path: fields → `documents` row |
| `seed/` | the illustrative catalog; `pnpm seed`, `pnpm seed:reset` |
| `shared/` | tier builders, guards, typed errors, return validators, `reads.ts` (`getMany`) |

## Tests

Convex function tests live HERE (`convex-test` needs an `import.meta.glob`
beside `convex/`): `pnpm test:convex`. `catalog.test.ts` seeds once and asks
every question a page asks, anonymously; `users.test.ts` holds the
authorization negatives. A guard is not done until it has failed.
