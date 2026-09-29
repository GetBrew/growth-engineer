<div align="center">

<img src="https://cdn.growth.engineer/assets/2026/09/growth-engineer-home-e4cdffcb.webp" alt="The growth.engineer home page, with the card that connects Claude to the MCP server">

<h1>growth.engineer</h1>

**Go-to-market tools and workflows, written as files any agent can run.**

An open-source catalog of go-to-market companies, the functions an agent can
call on each one, and workflows that chain those functions into a result.
Every entry is a markdown file in this repository.

<p>
  <a href="https://www.growth.engineer"><b>growth.engineer</b></a> &nbsp;·&nbsp;
  <a href="#connect-your-agent">Connect your agent</a> &nbsp;·&nbsp;
  <a href="#contribute">Contribute</a> &nbsp;·&nbsp;
  <a href="#local-development">Develop</a>
</p>

<p>
  <a href="https://www.growth.engineer"><img alt="Live site" src="https://img.shields.io/website?url=https%3A%2F%2Fwww.growth.engineer&style=flat-square&label=growth.engineer&up_message=live&up_color=2ea44f"></a>
  <a href="https://github.com/GetBrew/growth-engineer/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/GetBrew/growth-engineer/ci.yml?branch=main&style=flat-square&label=CI"></a>
  <img alt="MCP server with a read-only catalog" src="https://img.shields.io/badge/MCP-read--only_catalog-111?style=flat-square">
  <img alt="Built with Next.js" src="https://img.shields.io/badge/built_with-Next.js-111?style=flat-square&logo=nextdotjs&logoColor=white">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-111?style=flat-square"></a>
  <a href="https://github.com/GetBrew/growth-engineer/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/GetBrew/growth-engineer?style=flat-square"></a>
</p>

</div>

---

## What is this?

Handing a go-to-market tool to an agent means digging through docs written for
people: which key to create, which endpoint to call, whether there is an MCP
server, what a call costs. And a growth play that works usually lives in
someone's notes, where no agent can run it.

growth.engineer writes both down as markdown files an agent can follow:

| Entry | Example key | What the file holds |
| --- | --- | --- |
| **Company** | `apollo` | Who the company is and how an agent reaches it: MCP server, CLI or API, and the credential each one needs. |
| **Tool** | `apollo/enrich-person` | One function an agent can call: the exact MCP tool, CLI command or API endpoint, and the docs page that names it. |
| **Workflow** | `funding-signal-outbound` | Up to ten steps across tools that reach a result: the one motion it serves, the outcome the user gets, the inputs to ask for, how to set up each tool, and the steps. |

Paste a workflow file into Claude, ChatGPT, Cursor or any other agent and it
can run the play. The file tells the agent to ask before it sends a message,
spends money or changes data.

Facts come from each vendor's own documentation, and every tool links the page
that documents its call.

---

## Connect your agent

The site runs an MCP server at `https://www.growth.engineer/mcp`
(Streamable HTTP, no sign-in). Its `search` tool finds workflows, tools and
companies, and `get` returns a file; neither changes anything. A third tool,
`submit_feedback`, sends a bug report, request or question to the
maintainers. Every workflow is also an MCP prompt that
takes the workflow's inputs as arguments, and three more prompts
(`contribute-workflow`, `contribute-tool`, `contribute-company`) walk an agent
through adding to the catalog.

| Client | How to add it |
| --- | --- |
| Claude | Settings → Connectors → Add custom connector, then paste the URL. |
| Claude Code | `claude mcp add --transport http growth-engineer https://www.growth.engineer/mcp` |
| ChatGPT | Settings → Apps & Connectors → Advanced settings, turn on Developer mode, then Create. Paste the URL and pick No authentication. |
| Codex | In `~/.codex/config.toml`, add a `[mcp_servers.growth-engineer]` table with `url = "https://www.growth.engineer/mcp"`. |
| Cursor | In `mcp.json`, add `"growth-engineer": { "url": "https://www.growth.engineer/mcp" }` under `mcpServers`. |

### Or fetch the files

Every file is public. There is no key and no sign-in.

| URL | Returns |
| --- | --- |
| `/workflows/<name>.md` | A workflow, ready to paste into an agent |
| `/tools/<company>/<name>.md` | One tool |
| `/companies/<handle>.md` | A company and its tools |
| `/tags/<namespace>/<slug>.md` | Everything with a tag, such as `/tags/capability/enrich-contacts.md` |
| `/llms.txt` | The catalog's definitions and an index of every file |
| `/llms-full.txt` | Every company, tool and workflow file in one document |
| `/sitemap.xml` | Every page, with the date it last changed |

A company, tool or workflow page also returns its file to a request with
`Accept: text/markdown`.

```bash
# A workflow file
curl https://www.growth.engineer/workflows/funding-signal-outbound.md

# The same file, by content negotiation
curl -H 'Accept: text/markdown' https://www.growth.engineer/workflows/funding-signal-outbound
```

---

## Contribute

The catalog lives in this repository, and every addition or fix is a pull
request.

| To | Add or edit | Field reference | Agent skill |
| --- | --- | --- | --- |
| Share a workflow | `workflows/<name>.md` | [`workflows/README.md`](workflows/README.md) | [`add-workflow`](.agents/skills/add-workflow/SKILL.md) |
| Add a company and its tools | `companies/<handle>/company.md` and `tools/<name>.md` | [`companies/README.md`](companies/README.md) | [`research-company`](.agents/skills/research-company/SKILL.md) |
| Fix a fact | The file that states it | The same READMEs | |

Check your work before you open the pull request. CI runs the same check.

```bash
pnpm content:check   # every problem in the catalog, each with its file
```

[`CONTRIBUTING.md`](CONTRIBUTING.md) covers the few rules worth knowing first.

---

## How it works

There is no backend and no database. At build time, a compiler in
`lib/content/` reads every file, validates it against a strict schema and
resolves every reference. One renderer turns each company, tool and workflow
into the file agents fetch, and Next.js prerenders every page from the same
data. Deploying the site publishes the catalog.

```
companies/  workflows/  tags.yml
        │
        ▼
lib/content/                     read, validate, resolve, derive
        │
        ▼
lib/catalog/render-markdown.ts   one renderer, golden-tested
        │
        ├─▶ pages, prerendered at build
        ├─▶ .md files, /llms.txt, /llms-full.txt
        └─▶ /mcp, the MCP server
```

The one runtime store is optional: an Upstash Redis that counts how often each
workflow is copied, for its "Uses" and the Hot and Popular lists. Without it,
the counts are hidden.

Visits are measured with Vercel Web Analytics and Speed Insights, and AI
crawlers and AI-referred visits with Notra. See
[`docs/setup.md`](docs/setup.md#deploying-to-vercel).

---

## Project layout

```
growth-engineer/
├─ companies/<handle>/    company.md and tools/<name>.md (logos live on the CDN)
├─ workflows/<name>.md    one file per workflow
├─ tags.yml               the tag vocabulary
├─ app/                   Next.js routes: pages, .md files, /mcp, llms.txt, sitemap
├─ components/            layout, catalog lists, detail pages, UI primitives
├─ lib/
│  ├─ content/            the build-time compiler
│  ├─ catalog/            keys, the markdown renderer, search, loaders
│  ├─ mcp/                the MCP server's tools and prompts
│  ├─ seo/                metadata, structured data, llms.txt
│  └─ usage/              the optional copy counter
├─ tests/                 Vitest: golden files, the content suite, schema checks
├─ docs/                  architecture, data model, file format, setup
└─ .agents/skills/        add-workflow, research-company
```

---

## Local development

**Prerequisites:** Node 22+ and pnpm 11 (`corepack enable` installs the pinned
version).

```bash
pnpm install
pnpm dev             # http://localhost:3000
```

Edits to `companies/`, `workflows/` and `tags.yml` show on the next refresh.
Add `.md` to a company, tool or workflow URL to see the file an agent gets.

Nothing needs configuring. [`.env.example`](.env.example) lists the optional
variables:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The origin printed in `/llms.txt` and page metadata. On Vercel it defaults to the deployment's hostname. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` | The copy counter. Without them, the counts are hidden. |
| `GITHUB_TOKEN` | The star count in the header. Without it, GitHub allows 60 unauthenticated requests an hour. |
| `NOTRA_GEO_TOKEN` | AI-traffic analytics: the proxy reports AI crawlers and AI-referred visits to Notra. Without it, nothing is sent. |

### Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Starts the dev server |
| `pnpm content:check` | Parses, validates and renders the whole catalog |
| `pnpm check` | Biome and a fast typecheck |
| `pnpm test:run` | The unit suite, including the content checks |
| `pnpm tsc` / `pnpm lint` | The full typecheck and lint |
| `pnpm build` | Production build |
| `pnpm validate` | Lint, typecheck and tests together |
| `pnpm hygiene` | Docs links, the content tree, unused code, duplicate dependencies |

Heavy commands wait their turn behind a lock, so several worktrees can run
checks without running out of memory. See
[`docs/maintainers/validation.md`](docs/maintainers/validation.md).

---

## Deploy

The site runs on Vercel with the settings in [`vercel.json`](vercel.json).
Every page and file is generated at build time, so merging to `main` publishes
the catalog. [`docs/setup.md`](docs/setup.md) has the details.

---

## Docs

- [`AGENTS.md`](AGENTS.md): the rules for changing the site, for people and coding agents
- [`docs/architecture.md`](docs/architecture.md): the request path and what prerenders
- [`docs/data-model.md`](docs/data-model.md): what the build derives and every rule it enforces
- [`docs/markdown-files.md`](docs/markdown-files.md): the format of a rendered file
- [`docs/vision.md`](docs/vision.md): why the catalog exists and where it is going

---

## License

[MIT](LICENSE) © Brew
