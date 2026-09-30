# Architecture

One request, end to end, and where each decision is allowed to live.

```
companies/ workflows/ tags.yml ─▶ lib/content/read-tree.ts ──▶ lib/content/build-catalog.ts ──▶ the Catalog
   (the source: markdown          (the ONLY fs reader)          (pure: validate, resolve,       (in memory, once
    files, by pull request)                                      derive, render)                 per process)
                                                                       │
                     lib/catalog/render-markdown.ts, render-tag.ts ◀──┘ the ONE render path; golden-tested

agent / browser ─▶ proxy.ts ──────────▶ app/(site)/… ────────▶ lib/catalog/loaders.ts ──▶ the Catalog
                    │  .md URL or          (Server Components,    (every read; async,
                    │  Accept: text/markdown  prerendered whole)   resolves in memory)
                    ├─▶ app/api/markdown/[...path] ──▶ loadDocument(ref) ──▶ catalog.documents (prerendered)
                    └─▶ Notra, after the response: the AI-traffic report (page views, files, /llms.txt)
```

## Layers

**The source tree** — `companies/<handle>/{company.md, tools/*.md}`,
`workflows/<name>.md` (flat; the author is a GitHub login in the header), `tags.yml`.
Keys are paths; headers are strict YAML; a company's body is prose, a
workflow's body holds its steps, and a tool file is its header alone. The
community edits this and nothing else ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

**The compiler** (`lib/content/`) — `read-tree.ts` walks `companies/` and
`workflows/`, reads `tags.yml`, checks any logo file waiting for upload
(`logos.ts`), and is the only module that touches the filesystem. Logos are
served from cdn.growth.engineer ([`maintainers/logos.md`](maintainers/logos.md)).
`build-catalog.ts` runs one builder per kind (`build-tags`,
`build-companies`, `build-tools`, `build-workflows`): each parses its files
against a strict schema (`lib/schemas/content.ts`, zod, unknown fields
rejected), resolves every reference (a tool's calls on its company's ways
in, a workflow's tools and tags, aliases) and collects every problem into
one `ContentErrors` with file paths. `build-relations.ts` writes the links. `derive.ts` computes the
tags and search text; `build-documents.ts` renders
the files. The result is a `Catalog`: maps by key, the rendered documents by
ref, the alias map, the edges, the listing orders.

**The catalog** (`lib/catalog/catalog.ts`) — built once per process from
SYNCHRONOUS reads and memoized (re-read in development when the tree's
fingerprint changes). Synchronous is load-bearing: inside Next's prerender a
value that resolves without I/O keeps a route static.

**`proxy.ts`** — two jobs. It serves the markdown files: a `.md` URL, or a
company, tool or workflow page requested with `Accept: text/markdown`, is
rewritten to the file handler. And it reports AI traffic: when
`NOTRA_GEO_TOKEN` is set, each page view, file and `/llms.txt` fetch is sent
to Notra through `event.waitUntil`, after the response. Notra keeps AI
crawlers and visits referred by an AI assistant and drops the rest. The
matcher admits only those requests (and paths with a backslash or a bad `%`,
answered 404), so a Link prefetch, a client navigation or an asset never runs
the proxy. There is NO auth gate here and no auth provider anywhere; every
route is public.

**Pages** (`app/(site)/`) — Server Components that render their data
directly, with no `<Suspense>` and nothing that loads — except the copy
counts (`lib/usage/copies.ts`), the one request-time datum: each sits in a
`<Suspense>` hole that streams into the prerendered shell in the same
response, its fallback holding the space. The header's GitHub star count is
not a hole either: `next.config.ts` fetches it once per build and inlines it
(`process.env.GITHUB_STARS`, `lib/github-stars.ts`), so a page's prerendered
HTML and its request-time render print the same number. Fetched during a
render, it would drift from the shell as soon as the count moved, and React
would reject the HTML (error #418); the footer's year is inlined the same way,
for the same reason. Detail routes
declare `generateStaticParams` from `lib/catalog/static-params.ts`, await their params
themselves and prerender in full, content inline. The
listings prerender EVERY item and hand them to a client component
(`ToolsExplorer`, `CompanyDirectory`, `WorkflowsIndex`) that reads the URL
with `useSearchParams` and narrows the list in the browser — so no page reads
`searchParams` on the server and every filter permutation is instant. The
query exists only in the browser, so each listing prerenders with no query —
every row and link, fully static — and reads the URL once hydrated
(`useIsClient`), following it on every navigation after that.
Filters and search are still links and GET forms: the URL is the state. A
URL whose only job is to redirect is a route handler (`/tools/[handle]`),
with a relative `Location` so it prerenders too. Internal navigation is
always `next/link`, which prefetches on viewport and on hover. Vercel Web
Analytics and Speed Insights (`components/layout/vercel-analytics.tsx`, in
the root layout) read the route too, so they also mount once hydrated; they
draw nothing and are not in the prerendered HTML.

**Loaders** (`lib/catalog/loaders.ts`) — every server-side read. Async by
signature, in-memory by implementation; no `'use cache'`, no `cacheTag`, no
`connection()`. There is nothing to revalidate: a deploy is the publish.

## What prerenders

| Route | At build | Why |
| --- | --- | --- |
| `/companies/[handle]`, `/tools/[handle]/[name]` | fully static (`○`) | `generateStaticParams` + in-memory reads |
| `/workflows/[name]`, `/` | partial prerender (`◐`) when the copy counter is on, else fully static (`○`) | the page is the prerendered shell; only the copy counts (a workflow's Uses; the order of Hot and Popular) are holes, read at request time (`connection()`) through a `'use cache'` that asks the store at most once a minute, in one round trip, with the read-only token |
| `/api/markdown/[...path]` — every file, every alias | static (`●`) | the handler never reads the request; an alias is a 308 with a relative `Location` |
| `/tools/[handle]` shortcuts, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` | static | no request-time input |
| `…/opengraph-image` — one card per company, tool and workflow | static (`●`) | `generateStaticParams` on the image route; `next/og` draws it at build |
| `/tools`, `/companies`, and `/` (the workflow list; `/workflows` redirects there, query and all) | fully static (`○`) | every item is prerendered with no query; once hydrated, a client component reads the URL and narrows the list in the browser with the same pure search the tests run |
| `/add-a-workflow`, `/add-a-tool`, `/add-your-company` | fully static (`○`) | in-memory reads only; the guides quote their samples from the tree at build |
| `/mcp` | on request (`ƒ`) | a POST per tool call or prompt; stateless, the same catalog; read-only except `submit_feedback`, which posts to Notra |
| `/api/workflows/[name]/copies` | on request (`ƒ`) | one POST per page view that copies; a visitor counts once per workflow per 24 hours (`SET NX` on a hash of the address), then the total and today's bucket |

An unknown key on a detail route renders on demand, asks the alias map, and
answers with a real 308 or a 404. `dynamicParams`, `dynamic` and
`revalidate` are not allowed under Cache Components and are not used.

## Discovery: SEO, GEO and agents

Three audiences read the same facts through three doors, and the facts are
stated once:

| Audience | Reads | Source |
| --- | --- | --- |
| Search engines | canonical URL, Open Graph, the social card, schema.org JSON-LD (`Organization`, `SoftwareApplication`, `HowTo`, `CollectionPage`, `BreadcrumbList`), `/sitemap.xml` with per-page `lastmod`, `/robots.txt` (open everywhere but `/api/`), and a `Link: rel="canonical"` header on each company, tool and workflow file pointing at its page, so the page is indexed and not the file | `lib/seo/metadata.ts`, `lib/seo/structured-data.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/api/markdown` |
| Answer engines and AI crawlers | the same, plus `/llms.txt` (llmstxt.org: definitions, then every file with a summary) and `/llms-full.txt` (every company, tool and workflow file in one document); every AI crawler is named in `/robots.txt` | `lib/seo/llms.ts`, `lib/catalog/discovery.ts` |
| Agents | `.md` URLs, `Accept: text/markdown`, the `<link rel="alternate" type="text/markdown">` on every file page, `/llms.txt`, the MCP server at `/mcp` (`search`, `get`, `submit_feedback`, a prompt per workflow) | `proxy.ts`, `app/api/markdown`, `app/mcp`, `lib/mcp/server.ts` |

The definitions (company, tool, workflow, tag, how to read a file) live in
`lib/catalog/definitions.ts` and nowhere else; the llms preamble and the
structured data import them. `tests/seo.test.tsx` holds the sitemap, both
llms files and each file's canonical header to the catalog exactly: every
page, every file, nothing invented.

What agents do with it is measured in Notra. The proxy reports AI crawlers
and AI-referred visits (above), and the MCP server's `submit_feedback` tool
(`lib/mcp/feedback-tool.ts`) sends an agent's bug report, request or question
to the same Notra inbox. The server's instructions tell agents when to use
it.

## Search (`lib/catalog/search-words.ts`, `lib/catalog/search.ts`)

Pure and browser-safe. The WORDS are read one way everywhere
(`search-words.ts`): function words ("a", "for", "the") drop, kind words
("workflow", "tools", "vendor") name what to look for rather than what it
says, and each word is trimmed to a stem ("enriching" → "enrich") matched as
a prefix of the entity's search text — its own words plus its tags' labels
and synonyms; a hit in the name counts double. The GRAMMAR of the listings
is `lib/catalog/query.ts` (words + `namespace:slug` chips; OR within a
namespace, AND across; partial chip completion; the canonical URL).

- The listings and the ⌘K palette need EVERY word; they rank by score, then
  date, then key, over items prerendered into the page — nothing fetches.
- The home page's box suggests filters as you type
  (`lib/catalog/filter-suggestions.ts`): "outbound" offers the Outbound
  motion, "apollo" the company. A pick is a link to the URL with that chip
  (`/?motion=outbound&channel=email&q=funding`); Enter picks only an exact
  name, so any other word stays a word search.
- MCP `search` (`lib/mcp/search-tool.ts`) filters by type, tags, company,
  the tool a workflow uses, and author; when no entry matches every word it
  returns the closest matches with `isPartial: true` instead of nothing. MCP
  `get` returns a file, or — for a tag — everything carrying it. Its answers
  are composed per call from the catalog; the FILES are never rendered on
  the request path.

A query with no words in it (`???`) matches nothing.

## Where to add things

| You are adding | It goes in |
| --- | --- |
| A company, tool, workflow or tag | a file — [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| A page | `app/(site)/…`, rendering its data directly (no Suspense); `generateStaticParams` if it has params; reserve its first segment in `lib/catalog/keys.ts` |
| A field a file shows | the schema (`lib/schemas/content.ts`), the type (`lib/types/catalog.ts`), the renderer, its golden fixture, a negative test — in one commit |
| A projection | `lib/content/derive.ts`, the one writer |
| A read | a loader in `lib/catalog/loaders.ts`, and a case in `tests/content.test.ts` |
| A rule about the content | the `lib/content/build-*.ts` file that owns it, with a case in `tests/content-schema.test.ts` that FAILS first |
