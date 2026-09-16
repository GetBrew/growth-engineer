# Architecture

One request, end to end, and where each decision is allowed to live.

```
browser ──▶ proxy.ts ──▶ app/(app)/… ──▶ lib/convex/gateway.ts ──▶ Convex
   │        (Clerk gate)     (RSC)         (server transport)      (guards)
   └──────────── ConvexProviderWithAuth ──── websocket ───────────────▲
                 (named Clerk JWT template)                           │
                                                     convex/shared/builders.ts
```

## The layers

**`proxy.ts`** — the coarse gate. It decides *is this route reachable at all*,
from the one route policy in `lib/auth/routes.ts`. It never decides what data
you may see.

**Server components** — read through `lib/convex/gateway.ts`, which attaches
the caller identity Convex will verify. A raw `convex/nextjs` import elsewhere
is a lint error.

**Client components** — read through `hooks/use-authed-query.ts`, which holds
a query until the Clerk JWT has attached to the websocket.

**Convex functions** — the fine gate, and the only one that actually protects
data. Everything above it is convenience and latency.

## Why the identity is never an argument

The tier builders in `convex/shared/builders.ts` DECLARE the transport args and
CONSUME them: `input` returns `args: {}`, so a handler's `args` contains only
its own domain fields. A handler physically cannot read a caller-supplied
`orgId`; it reads the verified one from `ctx.actor`.

This is the difference between a convention and a guarantee. The convention
("call `requireOrgActor` first") is unenforceable: a reviewer has to prove, per
function, that no early return slips past the check, and the reviewer is you,
at 6pm, on your own diff. The builder makes the same property structural — the
guard runs before the handler is entered, and there is no path around it.

The second half is that a browser and a server call the same function. The
browser presents a Clerk JWT and cannot name anyone but itself. The server
presents a service token, which proves only that the CALL came from our
deployment — never that a person authorized it — so the person rides alongside
in `actingUserId` and a token that names nobody is refused for anything
user-scoped.

## The tiers

| Builder | Who | Reads |
| --- | --- | --- |
| `publicQuery` | anyone | nothing identity-scoped |
| `authenticatedQuery/Mutation` | any verified human | `ctx.actor.userId` |
| `orgMemberQuery/Mutation` | a member of the verified org | `ctx.actor.orgId` |
| `orgAdminMutation` | Clerk `org:admin` | the org control plane |
| `serviceMutation` | machines only | unreachable from a browser |

`serviceMutation` requires its token at the WIRE level, not at runtime. That
distinction is the whole tier: an optional token is a runtime-only guarantee
(`tsc` cannot see a caller that forgot it, and the function merely refuses); a
required one means a browser cannot form a well-typed call at all.

## Ownership is still checked on the row

The builder proves WHO is calling. Only the row proves they own it. Every
id-addressed read or write re-checks — and answers "not yours" as `NOT_FOUND`,
so an id space cannot be enumerated by watching which errors differ.

## Errors

Convex functions throw typed `ConvexError` payloads (`convex/shared/errors.ts`).
Convex redacts a plain `Error`'s message in production, so the client would see
"Server Error" and be able to show nothing useful. Callers decode with
`getAppErrorMessage(error, fallback)`: a typed message was written for this
user and is safe verbatim; anything else keeps the generic fallback.

## Where to add things

| You are adding | It goes in |
| --- | --- |
| A page | `app/(app)/…` (signed in) or `app/(marketing)/…` (public) |
| A backend function | `convex/<feature>.ts`, built with a tier builder |
| A table | `convex/schema.ts`, with the indexes its reads need |
| A shared guard | `convex/shared/auth.ts` — never a second copy |
| A server-side read | a `tenantQuery` call, never `fetchQuery` |
| A public API route | `app/api/…` plus an entry in `PUBLIC_API_ROUTE_PATTERNS` |
