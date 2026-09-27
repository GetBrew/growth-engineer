# Contributing

growth.engineer is a catalog of **companies**, the **tools** they make, and
**workflows** that put tools to work — and every entry is a markdown file in
this repository. Adding your company, a tool, or a workflow is a pull request
that adds files. The site is built from them.

```
companies/<handle>/company.md        who the company is
companies/<handle>/access/<id>.md    each way in: MCP server, CLI, API
companies/<handle>/tools/<slug>.md   each function an agent can call
workflows/<name>.md                  steps across tools that reach a result (flat; the author is your GitHub login)
tags/<namespace>/<slug>.md           the vocabulary (capability, motion, channel, category, fit)
```

Each folder has a README with the full field reference and a copy-paste
template: [`companies/README.md`](companies/README.md),
[`workflows/README.md`](workflows/README.md), [`tags/README.md`](tags/README.md).

## Add your company in three files

1. `companies/<handle>/company.md` — name, domain, category, logo, a short
   description. Put the logo under `public/logos/`.
2. `companies/<handle>/access/<id>.md` — one file per way in. Official MCP
   first, then CLI, then API; community-maintained options say who maintains
   them.
3. `companies/<handle>/tools/<slug>.md` — one file per **function**, named
   after a capability in `tags/capability/`, listing the exact operation for
   each way in (`mcp: acme_enrich_contacts`, `api: POST /v1/enrich`), exactly
   as the vendor's docs name it.

Then, with Node 22+ and pnpm 11 (`corepack enable` gives you the pinned pnpm):

```bash
pnpm install
pnpm content:check      # parses, resolves references, renders every file — errors name the file
pnpm dev                # http://localhost:3000/companies/<handle>
```

## Add a workflow

One file, `workflows/<name>.md` — the folder is flat, no subfolders. A short
YAML header (a title phrased as the result, your GitHub login as `author`,
tags), then the workflow in plain markdown: `## Inputs` to ask the user for,
`## Steps` — up to ten, each naming a published tool — and `## Done when`,
the checks that mean the job is done. It reads on GitHub exactly as it will
on the site; the build adds each tool's setup and the rules. Copy the
template in [`workflows/README.md`](workflows/README.md) or any file beside
it. Workflows are by people, not companies: the page credits `@you` and
links to your GitHub profile. The build links every step to its tool and
every tool back to the workflows that use it.

## The rules the build enforces

- **Keys are permanent.** A folder or file name is the key and the URL.
  Rename by adding the old key to `aliases`; the old URL redirects.
- **A tool is one function** with at least one way in. No way in yet? Set
  `status: draft`; it has no page until it does.
- **Steps resolve.** Every step links a tool file that exists and is
  published.
- **Tags exist.** Every tag names a file under `tags/`; `has:*` is computed
  and cannot be written.
- **Facts carry a date.** `updated` is when someone last checked the file.
- **Files stay short.** Tool files render to about 60 lines, workflows to
  about 120, with at most ten steps.
- **Nothing invented.** No placeholder companies, invented endpoints or
  made-up customers. If a fact is not public, leave the field out.

`pnpm content:check` runs every one of these and lists every problem with
its file and line. The same suite runs in CI on your pull request (a
maintainer approves the first run for a first-time contributor).

## Pull requests

- One company, workflow or fix per pull request keeps review fast.
- Fill in the template: what you added, and how you checked the facts.
- Maintainers review for accuracy and for the rules above, not for style —
  the build owns style.
- By contributing you agree your contribution is licensed under the
  repository's [MIT license](LICENSE).

## Working on the site itself

The app is Next.js with a build-time catalog compiler; there is no backend.
[`AGENTS.md`](AGENTS.md) holds the engineering invariants and the validation
ladder (`pnpm check` while editing, `pnpm tsc` and `pnpm lint` at handoff),
and routes to the deeper docs under [`docs/`](docs/).
