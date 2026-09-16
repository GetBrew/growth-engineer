# Project Rules

**All durable project invariants, validation commands, and the docs routing
table live in [`AGENTS.md`](AGENTS.md) — read it first and follow it exactly.**
This file is intentionally a thin pointer so the two cannot drift.

Quick orientation (full rules in `AGENTS.md`):

- **Validation is proportional**: `pnpm exec biome check --write <touched
  files>` + the exact test files while editing; `pnpm check` once per unit;
  `pnpm tsc` then `pnpm lint` once at final handoff.
- **Heavy commands are serialized** through `scripts/heavy-lock.mjs` — never
  call `tsc`, `vitest`, `next build` or `knip` directly.
- **Convex authorization is by construction**: every public function uses a
  tier builder from `convex/shared/builders.ts`; the handler reads
  `ctx.actor`, never a caller-supplied id.
- **Cache Components**: a page's default export is synchronous and returns a
  `<Suspense>`; every request-time read lives in the async child.
