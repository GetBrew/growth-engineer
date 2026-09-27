# Architecture

One request, end to end, and where each decision is allowed to live.

```
companies/ workflows/ tags.yml ─▶ lib/content/read-tree.ts ──▶ lib/content/build-catalog.ts ──▶ the Catalog
   (the source: markdown          (the ONLY fs reader)          (pure: validate, resolve,       (in memory, once
    files, by pull request)                                      derive, render)                 per process)
                                                                       │
                                     lib/catalog/render-markdown.ts ◀──┘ the ONE render path; golden-tested

agent / browser ─▶ proxy.ts ──────────▶ app/(site)/… ────────▶ lib/catalog/loaders.ts ──▶ the Catalog
                    │  .md URL or          (Server Components,    (every read; async,
                    │  Accept: text/markdown  prerendered whole)   resolves in memory)
                    └─▶ app/api/markdown/[...path] ──▶ loadDocument(ref) ──▶ catalog.documents (prerendered)
```

## Layers

**The source tree** — `companies/<handle>/{company.md, tools/*.md}`,
`workflows/<name>.md` (flat; the author is a GitHub login in the header), `tags.yml`.
Keys are paths; headers are strict YAML; bodies are prose. The community
edits this and nothing else ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

**The compiler** (`lib/content/`) — `read-tree.ts` walks the three
directories and is the only module that touches the filesystem.
`build-catalog.ts` runs one builder per kind (`build-tags`,
`build-companies`, `build-tools`, `build-workflows`): each parses its files
against a strict schema (`lib/schemas/content.ts`, zod, unknown fields
rejected), resolves every reference (a tool's calls on its company's ways
in, a workflow's tools and tags, aliases) and collects every problem into
one `ContentErrors` with file paths. `build-relations.ts` writes the edges. `derive.ts` computes the
projections that used to be database columns; `build-documents.ts` renders
the files. The result is a `Catalog`: maps by key, the rendered documents by
ref, the alias map, the edges, the listing orders.

**The catalog** (`lib/catalog/catalog.ts`) — built once per process from
SYNCHRONOUS reads and memoized (re-read in development when the tree's
fingerprint changes). Synchronous is load-bearing: inside Next's prerender a
value that resolves without I/O keeps a route static.

**`proxy.ts`** — one job: the markdown files. A `.md` URL, or a company,
tool or workflow page requested with `Accept: text/markdown`, is rewritten to
the file handler. Its matcher admits only those requests (and paths with a
backslash, answered 404), so a page view or a Link prefetch never runs it.
There is NO auth gate here and no auth provider anywhere; every route is
public.

**Pages** (`app/(site)/`) — Server Components that render their data
directly, with no `<Suspense>` and nothing that loads. Detail routes declare
`generateStaticParams` from `lib/catalog/static-params.ts`, await their params
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
always `next/link`, which prefetches on viewport and on hover.

**Loaders** (`lib/catalog/loaders.ts`) — every server-side read. Async by
signature, in-memory by implementation; no `'use cache'`, no `cacheTag`, no
`connection()`. There is nothing to revalidate: a deploy is the publish.

## What prerenders

| Route | At build | Why |
| --- | --- | --- |
| `/companies/[handle]`, `/tools/[handle]/[name]`, `/workflows/[name]` | fully static (`○`) | `generateStaticParams` + in-memory reads |
| `/api/markdown/[...path]` — every file, every alias | static (`●`) | the handler never reads the request; an alias is a 308 with a relative `Location` |
| `/tools/[handle]` shortcuts, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`, `/` | static | no request-time input |
| `…/opengraph-image` — one card per company, tool and workflow | static (`●`) | `generateStaticParams` on the image route; `next/og` draws it at build |
| `/tools`, `/companies`, `/workflows` | fully static (`○`) | every item is prerendered with no query; once hydrated, a client component reads the URL and narrows the list in the browser with the same pure search the tests run |
| `/contribute`, `/contribute/[guide]` | fully static (`○`) | in-memory reads only; the guides quote their samples from the tree at build |
| `/mcp` | on request (`ƒ`) | a POST per tool call; stateless, read-only, the same catalog |

An unknown key on a detail route renders on demand, asks the alias map, and
answers with a real 308 or a 404. `dynamicParams`, `dynamic` and
`revalidate` are not allowed under Cache Components and are not used.

## Discovery: SEO, GEO and agents

Three audiences read the same facts through three doors, and the facts are
stated once:

| Audience | Reads | Source |
| --- | --- | --- |
| Search engines | canonical URL, Open Graph, the social card, schema.org JSON-LD (`Organization`, `SoftwareApplication`, `HowTo`, `CollectionPage`, `BreadcrumbList`), `/sitemap.xml` with per-page `lastmod`, `/robots.txt` | `lib/seo/metadata.ts`, `lib/seo/structured-data.ts`, `app/sitemap.ts`, `app/robots.ts` |
| Answer engines and AI crawlers | the same, plus `/llms.txt` (llmstxt.org: definitions, then every file with a summary) and `/llms-full.txt` (every file in one document); every AI crawler is named in `/robots.txt` | `lib/seo/llms.ts`, `lib/catalog/discovery.ts` |
| Agents | `.md` URLs, `Accept: text/markdown`, the `<link rel="alternate" type="text/markdown">` on every file page, `/llms.txt`, the read-only MCP server at `/mcp` (`search`, `get`) | `proxy.ts`, `app/api/markdown`, `app/mcp`, `lib/mcp/server.ts` |

The definitions (company, tool, workflow, tag, how to read a file) live in
`lib/catalog/definitions.ts` and nowhere else; the llms preamble and the
structured data import them. `tests/seo.test.tsx` holds the sitemap and both llms files to the
catalog exactly: every page, every file, nothing invented.

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
| A second app | its own project — [`docs/microfrontends.md`](microfrontends.md) |
