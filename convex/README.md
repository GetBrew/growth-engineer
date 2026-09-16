# convex/

Backend functions, schema, and the authorization spine.

## Rules

1. **Every public function uses a tier builder** from
   [`shared/builders.ts`](shared/builders.ts). Never import `query` /
   `mutation` / `action` from `_generated/server` — `tests/convex-builders.test.ts`
   fails if you do.
2. **Read the actor from `ctx.actor`**, never from `args`. The builder consumed
   the caller's identity claims before the handler ran; that is the guarantee.
3. **Re-check ownership on the row** for anything addressed by id, and answer
   "not yours" as `NOT_FOUND`.
4. **Index what you read.** `.withIndex(...)`, `.take(n)`. Never `.filter(...)`
   as a substitute for an index, never an unbounded `.collect()`.
5. **Throw typed errors** from [`shared/errors.ts`](shared/errors.ts).
6. **Filenames** use letters, numbers, underscores and periods only — the
   Convex CLI rejects hyphens in function paths.

## Files

| File | Purpose |
| --- | --- |
| `schema.ts` | the single `defineSchema(...)` root export |
| `auth.config.ts` | which JWT issuer Convex trusts — see docs/setup.md |
| `shared/builders.ts` | the tier-named builders |
| `shared/auth.ts` | the reviewed guards; one place per decision |
| `shared/errors.ts` | typed `ConvexError` payloads |
| `tasks.ts` | worked example — copy its shape |
| `users.ts` | the Clerk user mirror, written only by the webhook |

## Adding a tier

The builders cover queries and mutations. An ACTION tier (for calling a
third-party API from Convex) is the same four lines over `customAction` and
`action` — it is not shipped unused, because a builder nothing calls is a
pattern nobody has checked.

## Tests

Convex function tests live HERE, not in `tests/` — `convex-test` needs an
`import.meta.glob` beside `convex/`. Run them with `pnpm test:convex`.

Write the negative cases. `tasks.test.ts` is the template: anonymous refused,
one user cannot touch another's row, a forged transport arg buys nothing.
