# Project Rules

**All durable project invariants, validation commands, and the docs routing
table live in [`AGENTS.md`](AGENTS.md) — read it first and follow it exactly.**
This file is intentionally a thin pointer so the two cannot drift.

Quick orientation (full rules in `AGENTS.md`):

- **The markdown file is the product.** Every tool and workflow renders to one
  file through `convex/model/render_markdown.ts`; files are generated, never
  hand-edited; the format is golden-tested against the design doc's examples.
- **Keys are permanent** (`clay`, `clay/enrich-contacts`, `brew/intent-to-meeting`);
  stored references are internal ids; a rename adds a `keyAliases` row.
- **Validation is proportional**: `pnpm exec biome check --write <touched
  files>` + the exact test files while editing; `pnpm check` once per unit;
  `pnpm tsc` then `pnpm lint` once at final handoff.
- **Heavy commands are serialized** through `scripts/heavy-lock.mjs` — never
  call `tsc`, `vitest`, `next build` or `knip` directly.
- **Convex authorization is by construction**: every public function uses a
  tier builder from `convex/shared/builders.ts`; reads are indexed + bounded.
- **Cache Components**: a page's default export is synchronous and returns a
  `<Suspense>`; the caching contract in `lib/catalog/loaders.ts` decides what
  is cached and what awaits `connection()`.
