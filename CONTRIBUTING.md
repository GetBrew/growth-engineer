# Contributing

growth.engineer is a catalog of **companies**, the **tools** they make, and
**workflows** that put tools to work — and every entry is a markdown file in
this repository. Adding your company, a tool, or a workflow is a pull request
that adds files. The site is built from them.

```
companies/<handle>/company.md        who the company is
companies/<handle>/access/<id>.md    each way in: MCP server, CLI, API
companies/<handle>/tools/<slug>.md   each function an agent can call
workflows/<owner>/<name>.md          steps across tools that reach a result
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
   each way in (`mcp: clay_enrich_contacts`, `api: POST /v1/enrich`).

Then:

```bash
pnpm install
pnpm content:check      # parses, resolves references, renders every file — errors name the file
pnpm dev                # http://localhost:3000/companies/<handle>
```

## Add a workflow

One file, `workflows/<owner>/<name>.md`: a title phrased as the result, the
inputs to ask the user for, up to ten steps that each name a published tool,
and the checks that mean the job is done. The rendered file is what an agent
runs, so write for the agent. Publish under your company's handle or your
own.

## The rules the build enforces

- **Keys are permanent.** A folder or file name is the key and the URL.
  Rename by adding the old key to `aliases`; the old URL redirects.
- **A tool is one function** with at least one way in. No way in yet? Set
  `status: draft`; it has no page until it does.
- **Steps resolve.** Every `tool` in a workflow exists and is published; a
  `via` names a way in that tool actually has.
- **Tags exist.** Every tag names a file under `tags/`; `agent:*` and
  `has:*` are computed and cannot be written.
- **Facts carry a date.** `updated` is when someone last checked the file.
  A tool's readiness stays `unverified` until `agent.checked` says a person
  verified its access.
- **Files stay short.** Tool files render to about 60 lines, workflows to
  about 120, with at most ten steps.
- **Nothing invented.** No placeholder companies, invented endpoints or
  made-up customers. If a fact is not public, leave the field out.

`pnpm content:check` runs every one of these and lists every problem with
its file path. The same suite runs in CI on your pull request.

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
