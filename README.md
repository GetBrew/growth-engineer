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
companies/<handle>/company.md        who the company is            → /companies/clay
companies/<handle>/access/<id>.md    each way in: MCP, CLI, API    (shared by the company's tools)
companies/<handle>/tools/<slug>.md   each function an agent calls  → /tools/clay/enrich-contacts
workflows/<name>.md                  steps that reach a result     → /workflows/funding-signal-outbound
tags/<namespace>/<slug>.md           the vocabulary                → capability, motion, channel, category, fit
```

- A **company** is a folder named by its permanent handle.
- A **tool is ONE function** — one thing an agent calls, tied to a specific
  MCP tool, CLI subcommand or API endpoint. A product with three functions is
  three files. Its slug is a capability from `tags/capability/`.
- A **workflow** is up to ten steps, each naming one tool, phrased as the
  result it reaches, written by a person (`author:` is a GitHub login). A
  growth hack is a workflow; there is no second kind. The build links every
  workflow to its tools and every tool to the workflows that use it.
- A tool's **agent readiness** (unverified, native, friendly, possible) is
  computed from its ways in and from whether a person has checked them.
  Unverified means unverified.

Adding your company is three files and a pull request:
[`CONTRIBUTING.md`](CONTRIBUTING.md). Each folder's README has the full
field reference: [`companies/`](companies/README.md),
[`workflows/`](workflows/README.md), [`tags/`](tags/README.md).

## How a file becomes the product

At build time the compiler under `lib/content/` reads every file, validates
it (strict schemas, resolved references, at most ten steps, unique keys),
derives what used to be database columns (readiness level, `has:*` tags,
counts, search text) and renders each company, tool and workflow through the
one renderer in `lib/catalog/render-markdown.ts` — the file agents fetch,
golden-tested byte for byte. Nothing renders at request time; nobody
hand-edits a rendered file. A deploy is the publish.

```
companies/ workflows/ tags/  ─▶  lib/content/build-catalog.ts  ─▶  the Catalog (in memory)
                                        │                              ├▶ pages (prerendered)
                                        └▶ lib/catalog/render-markdown ├▶ /…/*.md files (prerendered)
                                                                       └▶ /llms.txt
```

## For agents

Every page answers `Accept: text/markdown` with its file, or append `.md`:
`/tools/clay/enrich-contacts.md`, `/workflows/funding-signal-outbound.md`,
`/companies/clay.md`. `/llms.txt` lists every file. No sign-in, no rate
limit, no key. Read-only MCP (`search`, `get`) arrives later.

## Running the site

```bash
pnpm install
pnpm dev                 # http://localhost:3000 — edits under companies/ etc. show on refresh
pnpm content:check       # validate the catalog: every problem with its file path
```

There is no backend and no environment to configure. `.env.example` lists
the two optional public variables (site origin, logo client id).

| Command | What it does |
| --- | --- |
| `pnpm content:check` | Parse, validate and render the whole catalog (also part of `pnpm test:run`) |
| `pnpm check` | Biome + fast typecheck — once per unit of work |
| `pnpm tsc` / `pnpm lint` | The full gate, at handoff |
| `pnpm test:run` | The unit suite: goldens, key grammar, search grammar, the content suite |
| `pnpm build` · `pnpm perf:bundle` | Production build · client bundle ratchet |
| `pnpm hygiene` | Docs links, content tree, knip, duplicate deps |

## The routes

| Route | Shows |
| --- | --- |
| `/` | Featured workflows, newest tools, companies |
| `/companies`, `/companies/[handle]` | The directory by category; a company, its tools, workflows using them |
| `/tools`, `/tools/[handle]/[name]` | Search (words + `has:mcp`-style chips); THE tool file + its ways in |
| `/tools/[handle]` | A shortcut: 308 to the single tool, or to the company |
| `/workflows`, `/workflows/[name]` | Featured / New, by tag; THE workflow file, how it runs, the tools it is built from |
| `/map`, `/map/[type]/[key]` | The relationship map: what is connected to what, one prerendered page per node |
| `…/*.md`, `Accept: text/markdown`, `/llms.txt` | The raw files, for agents |

## Layout

```
companies/ workflows/ tags/   THE DATA — see CONTRIBUTING.md
app/
  (site)/                     every page: /, companies, tools, workflows, map, submit
  api/markdown/[...path]      the .md files (proxy.ts rewrites .md URLs and Accept: text/markdown here)
  llms.txt                    the file index
lib/
  content/                    the compiler: read the tree, validate, resolve, derive, render
  catalog/                    PURE: keys, agent-level rules, THE renderer, search grammar, types
  catalog/loaders.ts          what pages read; catalog.ts builds the catalog once per process
components/                   site chrome, catalog rows and detail pages, the map, ui primitives
tests/                        goldens (tests/fixtures/markdown), the content suite, the negatives
docs/                         vision, file schema, architecture, validation, ci, performance
```

## Docs

[`AGENTS.md`](AGENTS.md) holds the engineering invariants and routes to
everything else: [`docs/vision.md`](docs/vision.md) ·
[`docs/data-model.md`](docs/data-model.md) ·
[`docs/markdown-files.md`](docs/markdown-files.md) ·
[`docs/architecture.md`](docs/architecture.md) · [`docs/setup.md`](docs/setup.md).
