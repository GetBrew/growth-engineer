# Project Rules

**All durable project invariants, validation commands, and the docs routing
table live in [`AGENTS.md`](AGENTS.md) — read it first and follow it exactly.**
This file is intentionally a thin pointer so the two cannot drift.

Quick orientation (full rules in `AGENTS.md`):

- **The catalog is the repository.** Companies, tools and workflows are
  markdown files under `companies/`, `workflows/` and `tags/`; to change a
  fact, change the file ([`CONTRIBUTING.md`](CONTRIBUTING.md)). There is no
  backend.
- **The rendered markdown file is the product.** Every tool and workflow
  renders through `lib/catalog/render-markdown.ts` at build time; rendered
  files are never hand-edited; the format is golden-tested.
- **Keys are permanent** and they ARE the paths (`clay`,
  `clay/enrich-contacts`, `intent-to-meeting`); `workflows/` is flat and a
  workflow's `author` is a GitHub login; a rename adds the old key under
  `aliases:`.
- **Validation is proportional**: `pnpm exec biome check --write <touched
  files>` + the exact test files while editing; `pnpm content:check` for
  catalog data; `pnpm check` once per unit; `pnpm tsc` then `pnpm lint` once
  at final handoff.
- **Heavy commands are serialized** through `scripts/heavy-lock.mjs` — never
  call `tsc`, `vitest`, `next build` or `knip` directly.
- **Everything prerenders**: the catalog is built once per process from sync
  reads; every page and filter permutation is static (listings narrow in the
  browser); internal links are `next/link`.
