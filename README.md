# growth.engineer

The agent-friendly marketplace for go-to-market tools and workflows.

People come here to find three things: **companies**, the **tools** those
companies make, and **workflows** that put tools to work. A **growth hack** is
a workflow that uses a single tool. Every tool and workflow is **one markdown
file any agent can run** — copying that file is the whole setup.

Powered by [Brew](https://brew.new). Built on
[`GetBrew/next-convex-clerk-starter`](https://github.com/GetBrew/next-convex-clerk-starter).

## Why

Whether the motion is cold outbound, warm inbound or midbound, finding the
right tool is hard: what it can do, what it costs to reach, whether an agent
can drive it, who else runs it. It is harder still to hand the answer to an
agent. growth.engineer is a result-based catalog where every listing is
readable by people and runnable by agents: the same page is a markdown file
with the setup, the inputs, the steps and the rules inline.

- **Companies** make tools. `clay`
- **Tools** are one product each, with every way in — MCP, CLI, API — and an
  agent-readiness level from checked facts. `clay/clay`
- **Workflows** are steps across tools that reach a result; a hack is one
  tool. `brew/intent-to-meeting`

Full vision: [`docs/vision.md`](docs/vision.md).

## Quickstart

```bash
pnpm install
cp .env.example .env.local     # then fill in Convex + Clerk (docs/setup.md)
npx convex dev                  # one terminal: pushes schema + functions, watches convex/
pnpm seed                       # 25 companies, 25 tools, 12 workflows, every file rendered
pnpm dev                        # http://localhost:3000
```

Convex is required. Clerk is optional until you need the signed-in surface;
without it every public page, file and search still works.
[`docs/setup.md`](docs/setup.md) has the whole first run, including the Clerk
JWT template everything authenticated depends on.

## The routes

| Route | Shows |
| --- | --- |
| `/` | New tools, trending workflows |
| `/companies`, `/companies/[handle]` | The directory; a company, its tools, workflows using them |
| `/tools`, `/tools/[handle]/[name]` | Search (words + chips); THE tool file + workflows using it |
| `/tools/[handle]` | A shortcut (route handler): 308 to the single tool, or to the company |
| `/workflows`, `/workflows/[owner]/[name]` | Trending / Top / New; THE workflow file + versions |
| `/hacks` | Workflows with one tool |
| `…/*.md`, `Accept: text/markdown`, `/llms.txt` | The raw files, for agents |
| `/submit` | Signed in. The publish flow, arriving with the pipeline |

## For agents

Reads need no sign-in. Fetch any page with `Accept: text/markdown`, or its
`.md` URL, to get the file; `/llms.txt` lists every file. Read-only MCP
(`search`, `get`, `resolve`) and a REST mirror arrive later, rate-limited per
IP with a free key for more.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm dev:convex` | Next dev server (cache prune, heap cap, flusher reap) / Convex dev |
| `pnpm seed` / `pnpm seed:reset` | Load the illustrative catalog, idempotently / remove it |
| `pnpm check` | Biome + fast typecheck — once per unit of work |
| `pnpm tsc` / `pnpm lint` | The full gate, at handoff (`pnpm tsc app` for one program) |
| `pnpm test:run` / `pnpm test:convex` | Unit suite / Convex function suite (the authorization tests) |
| `pnpm validate` | Everything, in order |
| `pnpm build` · `pnpm perf:bundle` | Production build · client bundle ratchet |
| `pnpm hygiene` | Docs links, Convex codegen freshness, knip, duplicate deps |

## Layout

```
app/
  (site)/                  every page, with the site chrome: /, companies, tools, workflows, hacks, submit
  api/markdown/[...path]   the .md files (proxy.ts rewrites .md URLs and Accept: text/markdown here)
  api/revalidate           purge a ref's cache, service-token gated
  llms.txt                 the file index
convex/
  schema.ts                the data model, v0.3.1 (docs/data-model.md)
  model/                   PURE: keys + refs, agent-level rules, THE markdown renderer
  companies.ts tools.ts workflows.ts tags.ts documents.ts aliases.ts   public reads, indexed + bounded
  tools_search.ts          the search query plan (candidates from one index, then post-filter)
  documents_render.ts      the one render path: fields → documents row
  seed/                    the illustrative catalog
  shared/                  tier builders, guards, validators, `getMany` point reads
lib/
  catalog/loaders.ts       server loaders + the caching contract
  catalog/query.ts         the search grammar (words, chips, URL)
  convex/gateway.ts        the only server-side Convex transport
components/
  site/ catalog/ document/ marketing/ ui/
docs/                      vision, data model, file contract, architecture, setup, validation, ci
```

## Fonts

The UI uses the Season variable font under a **trial license**
(`public/fonts/season/LicenseAgreement.pdf`). Buy the license before this
repository or the site goes public; the font is one `--font-sans` token, so
swapping it is a one-line change in `app/layout.tsx`.

## Docs

[`AGENTS.md`](AGENTS.md) holds the invariants and routes to everything else:
[`docs/vision.md`](docs/vision.md) · [`docs/data-model.md`](docs/data-model.md)
· [`docs/markdown-files.md`](docs/markdown-files.md) ·
[`docs/architecture.md`](docs/architecture.md) · [`docs/setup.md`](docs/setup.md).
