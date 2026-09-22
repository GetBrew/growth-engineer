# Architecture

One request, end to end, and where each decision is allowed to live.

```
companies/ workflows/ tags/ ──▶ lib/content/read-tree.ts ──▶ lib/content/build-catalog.ts ──▶ the Catalog
   (the source: markdown          (the ONLY fs reader)          (pure: validate, resolve,       (in memory, once
    files, by pull request)                                      derive, render)                 per process)
                                                                       │
                                     lib/catalog/render-markdown.ts ◀──┘ the ONE render path; golden-tested

agent / browser ─▶ proxy.ts ──────────▶ app/(site)/… ────────▶ lib/catalog/loaders.ts ──▶ the Catalog
                    │  .md URL or          (sync RSC shells       (every read; async,
                    │  Accept: text/markdown  + Suspense)          resolves in memory)
                    └─▶ app/api/markdown/[...path] ──▶ loadDocument(ref) ──▶ catalog.documents (prerendered)
```

## Layers

**The source tree** — `companies/<handle>/{company.md, access/*.md,
tools/*.md}`, `workflows/<name>.md` (flat; the author is a GitHub login in the header), `tags/<namespace>/<slug>.md`.
Keys are paths; headers are strict YAML; bodies are prose. The community
edits this and nothing else ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

**The compiler** (`lib/content/`) — `read-tree.ts` walks the three
directories and is the only module that touches the filesystem.
`build-catalog.ts` and `build-entities.ts` parse each file against its
schema (`schemas.ts`, zod, unknown fields rejected), resolve every reference
(a tool's access ids, a workflow's tools and tags, aliases) and collect every
problem into one `ContentErrors` with file paths. `derive.ts` computes the
projections that used to be database columns; `build-documents.ts` renders
the files. The result is a `Catalog`: maps by key, the rendered documents by
ref, the alias map, the edges, the listing orders.

**The catalog** (`lib/catalog/catalog.ts`) — built once per process from
SYNCHRONOUS reads and memoized (re-read in development when the tree's
fingerprint changes). Synchronous is load-bearing: inside Next's prerender a
value that resolves without I/O keeps a route static.

**`proxy.ts`** — one job: the markdown files. A `.md` URL or any page
requested with `Accept: text/markdown` is rewritten to the file handler.
There is NO auth gate here and no auth provider anywhere; every route is
public.

**Pages** (`app/(site)/`) — Server Components. A page's default export is
synchronous and returns a `<Suspense>`; the async child does the reads. Detail
routes declare `generateStaticParams` from `lib/catalog/static-params.ts`
and prerender in full; so does every map focus (`/map/<type>/<key>`). The
listings prerender EVERY item and hand them to a client component
(`ToolsExplorer`, `CompanyDirectory`, `WorkflowsIndex`) that reads the URL
with `useSearchParams` and narrows the list in the browser — so no page reads
`searchParams` on the server and every filter permutation is instant.
Filters and search are still links and GET forms: the URL is the state. A
URL whose only job is to redirect is a route handler (`/tools/[handle]`),
with a relative `Location` so it prerenders too. Internal navigation is
always `next/link`, which prefetches on viewport and on hover.

**Loaders** (`lib/catalog/loaders.ts`) — every server-side read. Async by
signature, in-memory by implementation; no `'use cache'`, no `cacheTag`, no
`connection()`. There is nothing to revalidate: a deploy is the publish.

## What prerenders

| Route | At build | Why |
| --- | --- | --- |
| `/companies/[handle]`, `/tools/[handle]/[name]`, `/workflows/[name]` (+ `@N`), `/map/[...focus]` | fully static (`○`) | `generateStaticParams` + in-memory reads |
| `/api/markdown/[...path]` — every file, every current pin, every alias | static (`●`) | the handler never reads the request; an alias is a 308 with a relative `Location` |
| `/tools/[handle]` shortcuts, `/llms.txt`, `/`, `/submit` | static | no request-time input |
| `/tools`, `/companies`, `/workflows`, `/map` | fully static (`○`) | every item is prerendered into the page; a client component reads the URL and narrows the list in the browser with the same pure search the tests run |

An unknown key on a detail route renders on demand, asks the alias map, and
answers with a real 308 or a 404. `dynamicParams`, `dynamic` and
`revalidate` are not allowed under Cache Components and are not used.

## Search v1 (`lib/catalog/search.ts`)

Pure and browser-safe, over the items a listing prerenders (the list rows
plus `searchText`); the same functions run in the tests and in the client
components. The GRAMMAR is `lib/catalog/query.ts`
(words + `namespace:slug` chips; OR within a namespace, AND across; partial
chip completion; the canonical URL) and is shared with the search box. The
EXECUTION: every word must start a token of the entity's search text (a hit
in the name counts double); chips filter on facts each entity carries —
`agent:` and `has:` from a tool's access, `capability:` from its slug,
`category:` from its company. Results are ranked by score, then date, then
key. MCP `search` will reuse both halves.

## Where to add things

| You are adding | It goes in |
| --- | --- |
| A company, tool, workflow or tag | a file — [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| A page | `app/(site)/…`, sync shell + Suspense child; `generateStaticParams` if it has params; reserve its first segment in `lib/catalog/keys.ts` |
| A field a file shows | the schema (`lib/content/schemas.ts`), the type, the renderer, its golden fixture, a negative test — in one commit |
| A projection | `lib/content/derive.ts`, the one writer |
| A read | a loader in `lib/catalog/loaders.ts`, and a case in `tests/content.test.ts` |
| A rule about the content | `build-catalog.ts` / `build-entities.ts`, with a case in `tests/content-schema.test.ts` that FAILS first |
| A second app | its own project — [`docs/microfrontends.md`](microfrontends.md) |
