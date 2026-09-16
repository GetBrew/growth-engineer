# Architecture

One request, end to end, and where each decision is allowed to live.

```
agent / browser ─▶ proxy.ts ──────▶ app/(site)/… ──▶ lib/catalog/loaders.ts ──▶ Convex publicQuery reads
                    │  .md URL or        (RSC shells      (publicQuery transport,      (indexed, bounded,
                    │  Accept: text/markdown  + Suspense)    the caching contract)      tier builders)
                    └─▶ app/api/markdown/[...path] ──▶ documents.getByRef ──▶ documents table
                                                                               ▲
                                              convex/documents_render.ts ──────┘  the ONE render path
                                              convex/model/render_markdown.ts     pure; golden-tested
```

## Layers

**`proxy.ts`** — two jobs, in order. First, the markdown files: a `.md` URL
or any page requested with `Accept: text/markdown` is rewritten to the file
handler before auth runs (agents carry no session, and on Vercel the proxy
runs ahead of the CDN cache, which does not key on `Vary`). Second, the
coarse auth gate from the one route policy in `lib/auth/routes.ts`: `/submit`
and `/api/*` are private by default, with the four public API carve-outs
listed with their reasons.

**Pages** (`app/(site)/`) — Server Components. A page's default export is
synchronous and returns a `<Suspense>`; the async child does every
request-time read. Filters and search are links and GET forms: the URL is
the state, so an agent can use the same URL.

**Loaders** (`lib/catalog/loaders.ts`) — every server-side read, through the
identity-less `publicQuery` transport in `lib/convex/gateway.ts`. This is
also where the caching contract lives.

**Convex** — `publicQuery` functions built with the tier builders, every read
indexed and bounded. The `documents` table holds the files; nothing renders
on the request path.

## The caching contract

`convex/nextjs` fetches are `cache: 'no-store'`. Inside a `'use cache'` scope
they run for real — including at build time for a page with no params — and
a `try/catch` inside that scope would cache the empty result for the whole
`cacheLife` window (on Vercel, production builds prerender against the
*previous* Convex deployment). So:

| Read | Treatment | Why |
| --- | --- | --- |
| Per key (`[handle]`, `[owner]/[name]`, the `.md` file) | `'use cache: remote'` + `cacheTag(ref)` + one hour fresh / a day stale | Keyed by request-time params, so it never runs at build; `revalidateTag(ref, 'max')` purges the page and its file together |
| Lists (`/`, `/companies`, `/workflows`, `/hacks`) | plain read after `await connection()` in the Suspense child | The build stops at the boundary and never contacts Convex; Convex's query cache is the cache |
| Search (`/tools?q=`) | plain read, never cached here | unique per URL |
| Errors | never caught inside a cached scope | `error.tsx` renders them; an outage is never cached as an empty catalog |

Verified in CI: `NEXT_PRIVATE_DEBUG_CACHE=1 pnpm build` with placeholder env
makes zero Convex requests, and every catalog route is `◐` (partial
prerender).

## Search v1 (`convex/tools_search.ts`, behind `tools.search`)

Index-only and bounded, in two steps. **Candidates** (≤ 60): with words, the
`search_tools` index filtered to published, plus one `agentLevel` when exactly
one `agent:` chip is present; with curated chips only, the most selective tag
group (fewest tagged tools) read through `taggings.by_tag_popular` — chips in
one group union; with derived chips only, `tools.by_agent_level`; with
nothing, the newest tools. **Post-filter** in memory from fields already on
the row (`agentLevel`, `access[].type`), then the remaining curated groups
through `taggings.by_entity_tag` point reads (AND across groups). The
grammar — words, chips, partial completion, the canonical URL — is pure
(`lib/catalog/query.ts`) and shared with the search box; MCP `search` will
reuse both. Recall is bounded by the candidate cap; a dedicated search engine
takes over when that stops being enough.

## Convex authorization

The tier builders in `convex/shared/builders.ts` declare AND consume the
transport args, so a handler physically cannot read a caller-supplied id — it
reads `ctx.actor`. The catalog is `publicQuery` (anyone); the Clerk mirror is
`serviceMutation` (machine only, unreachable from a browser);
`internalMutation` is confined to the seed and the render pipeline.
`convex/model/*` is pure so Next can bundle the key grammar and the renderer
too.

## Where to add things

| You are adding | It goes in |
| --- | --- |
| A page | `app/(site)/…`, sync shell + Suspense child; reserve its first segment in `convex/model/keys.ts` |
| A public read | a `publicQuery` in the entity's module, indexed + `.take()`, then a loader under the contract |
| A field that a file shows | the schema (additive), the renderer, its golden fixture, in one commit |
| A projection | the helper that owns it, and the seed |
| A machine write from Next | `serviceMutation` + `systemMutation` |
| A public API route | `app/api/…` plus a reasoned entry in `PUBLIC_API_ROUTE_PATTERNS` |
| The admin app | its own project — [`docs/microfrontends.md`](microfrontends.md) |
