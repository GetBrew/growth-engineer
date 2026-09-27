# growth.engineer

The open-source, agent-friendly catalog of go-to-market tools and workflows.

**Companies** make **tools**; **workflows** put tools to work. Every tool and
workflow is **one markdown file any agent can run** — the setup, the inputs,
the steps and the rules, inline. Copying that file is the whole product
action. The catalog itself is markdown too: every entry is a file in this
repository, and the site is built from them.

Brought to you by [Brew](https://brew.new). MIT licensed.

## The catalog is the repo

```
companies/<handle>/company.md        who the company is, its ways in → /companies/clay
companies/<handle>/tools/<name>.md   each function an agent calls  → /tools/clay/enrich-contacts
workflows/<name>.md                  steps that reach a result     → /workflows/funding-signal-outbound
tags.yml                             the vocabulary                → capability, motion, channel, category
```

- A **company** is a folder named by its permanent handle.
- A **tool is ONE function** — one thing an agent calls, tied to a specific
  MCP tool, CLI command or API endpoint. A product with three functions is
  three files, each named after its function and shelved under a capability
  from `tags.yml`.
- A **workflow** is up to ten steps, each naming one tool, phrased as the
  result it reaches, written by a person (`author:` is a GitHub login). A
  growth hack is a workflow; there is no second kind. The build links every
  workflow to its tools and every tool to the workflows that use it.

Adding your company is a `company.md`, one file per function, and a pull request:
[`CONTRIBUTING.md`](CONTRIBUTING.md). Each folder's README has the full
field reference: [`companies/`](companies/README.md),
[`workflows/`](workflows/README.md), and the vocabulary in
[`tags.yml`](tags.yml).

## How a file becomes the product

At build time the compiler under `lib/content/` reads every file, validates
it (strict schemas, resolved references, at most ten steps, unique keys),
derives what used to be database columns (`has:*` tags, counts, search
text) and renders each company, tool and workflow through the
one renderer in `lib/catalog/render-markdown.ts` — the file agents fetch,
golden-tested byte for byte. Nothing renders at request time; nobody
hand-edits a rendered file. A deploy is the publish.

```
companies/ workflows/ tags.yml ─▶ lib/content/build-catalog.ts  ─▶  the Catalog (in memory)
                                        │                              ├▶ pages (prerendered)
                                        └▶ lib/catalog/render-markdown ├▶ /…/*.md files (prerendered)
                                                                       └▶ /llms.txt
```

## For agents

Every company, tool and workflow page answers `Accept: text/markdown` with
its file, or append `.md`: `/tools/clay/enrich-contacts.md`,
`/workflows/funding-signal-outbound.md`, `/companies/clay.md`. `/llms.txt` defines the four words the catalog uses and
links every file with a one-line summary; `/llms-full.txt` is every file in
one document. Every HTML page declares its file as a `text/markdown`
alternate and carries schema.org data (a company is an `Organization`, a tool
a `SoftwareApplication`, a workflow a `HowTo` with one step per step). No
sign-in, no rate limit, no key. Any MCP client can connect to `/mcp`
(Streamable HTTP, read-only): `search` finds files, `get` returns one.

The definitions themselves live in ONE place, `lib/catalog/definitions.ts`,
and feed `/llms.txt` and the structured data.

## Running the site

```bash
pnpm install
pnpm dev                 # http://localhost:3000 — edits under companies/ etc. show on refresh
pnpm content:check       # validate the catalog: every problem with its file path
```

There is no backend and no environment to configure. `.env.example` lists
the one optional public variable, the site origin.

| Command | What it does |
| --- | --- |
| `pnpm content:check` | Parse, validate and render the whole catalog (also part of `pnpm test:run`) |
| `pnpm check` | Biome + fast typecheck — once per unit of work |
| `pnpm tsc` / `pnpm lint` | The full gate, at handoff |
| `pnpm test:run` | The unit suite: goldens, key grammar, search grammar, the content suite |
| `pnpm build` · `pnpm perf:bundle` | Production build · client bundle ratchet |
| `pnpm hygiene` | Docs links, the content tree, knip, duplicate deps |

## The routes

| Route | Shows |
| --- | --- |
| `/` | Connect over MCP; the newest workflows and tools, companies |
| `/companies`, `/companies/[handle]` | The directory by category; a company, its tools, workflows using them |
| `/tools`, `/tools/[handle]/[name]` | Search (words + `has:mcp`-style chips); THE tool file + its ways in |
| `/tools/[handle]` | A shortcut: 308 to the single tool, or to the company |
| `/workflows`, `/workflows/[name]` | Featured / New, by tag; THE workflow file, how it runs, the tools it is built from |
| `/contribute`, `/contribute/[guide]` | How to add a workflow, a tool or a company, with samples quoted from the repository |
| `…/*.md`, `Accept: text/markdown`, `/llms.txt`, `/llms-full.txt` | The raw files, for agents; the index with definitions; the whole corpus |
| `/mcp` | The read-only MCP server (`search`, `get`) — the one dynamic route |
| `/robots.txt`, `/sitemap.xml`, `…/opengraph-image` | Every crawler allowed (AI crawlers named); every page with its `updated` date; one social card per page, drawn at build |

## Layout

```
companies/ workflows/ tags.yml  THE DATA — see CONTRIBUTING.md
app/
  (site)/                     every page: /, companies, tools, workflows, contribute
  api/markdown/[...path]      the .md files (proxy.ts rewrites .md URLs and Accept: text/markdown here)
  mcp/                        the read-only MCP server (lib/mcp/server.ts is the JSON-RPC)
  llms.txt, llms-full.txt     the file index with definitions; the whole corpus
  robots.ts, sitemap.ts       every crawler allowed; every page, with its date
  **/opengraph-image.tsx      the social cards, one per page, drawn at build
lib/
  content/                    the compiler: read the tree, validate, resolve, derive, render
  catalog/                    PURE: keys, THE renderer, search grammar
  catalog/definitions.ts      THE definitions (company, tool, workflow, tag), stated once
  catalog/loaders.ts          what pages read; catalog.ts builds the catalog once per process
  catalog/discovery.ts        what the sitemap and llms.txt read
  schemas/content.ts          the strict header schemas (zod)
  types/catalog.ts            the catalog's types
  seo/                        per-page metadata, schema.org builders, the llms preamble
components/                   site chrome, catalog rows and detail pages, ui primitives
tests/                        goldens (tests/fixtures/markdown), the content suite, the negatives
docs/                         vision, file schema, architecture, validation, ci, performance
```

## Docs

[`AGENTS.md`](AGENTS.md) holds the engineering invariants and routes to
everything else: [`docs/vision.md`](docs/vision.md) ·
[`docs/data-model.md`](docs/data-model.md) ·
[`docs/markdown-files.md`](docs/markdown-files.md) ·
[`docs/architecture.md`](docs/architecture.md) · [`docs/setup.md`](docs/setup.md).
