# Contributing

Every entry in growth.engineer is a markdown file in this repository, and a
contribution is a pull request that adds or edits files. The site, the `.md`
files agents fetch and the MCP server are all built from them.

## What you can add

| You want to | Add or edit | The fields and a template | An agent can do it with |
| --- | --- | --- | --- |
| Share a growth play | `workflows/<name>.md` | [`workflows/README.md`](workflows/README.md) | the [`add-workflow`](.agents/skills/add-workflow/SKILL.md) skill |
| Add a company and what an agent can call on it | `companies/<handle>/company.md`, `tools/<name>.md`, an optional `logo.svg` | [`companies/README.md`](companies/README.md) | the [`research-company`](.agents/skills/research-company/SKILL.md) skill |
| Fix a fact | the file that states it | the same READMEs | — |

A new word for the vocabulary (a capability, category, channel or motion)
goes in [`tags.yml`](tags.yml), which explains itself at the top, in the same
pull request as the first file that uses it.

## Check your work

With Node 22+ and pnpm 11 (`corepack enable` gives you the pinned pnpm):

```bash
pnpm install
pnpm content:check      # every problem in the catalog, each with its file (and line, in a workflow's body)
pnpm dev                # http://localhost:3000 (pnpm dev -p 3001 for another port); append .md to a page for its file
```

CI runs the same check on every pull request, so you can also open one and
read the result there.

## Three rules worth knowing up front

- **Keys are permanent.** A file or folder name is its URL. To rename, add
  the old name under `aliases:`; the old URL redirects.
- **Nothing invented.** Every call, URL and fact comes from the vendor's own
  docs, and `docs:` links the page that names the call. If a fact is not
  public, leave the field out.
- **The build owns the format.** You write the facts and the steps; the build
  adds each tool's setup and the rules. Never edit a rendered file.

Everything else the build enforces is listed in
[`docs/data-model.md`](docs/data-model.md#rules-the-build-enforces).

## Pull requests

- One workflow, company or fix per pull request keeps review fast.
- Fill in the template: what you added, and how you checked the facts.
- Maintainers review for accuracy, not style — the build owns style.
- By contributing you agree your contribution is licensed under the
  repository's [MIT license](LICENSE).

## Working on the site itself

The app is Next.js with a build-time catalog compiler; there is no backend.
[`AGENTS.md`](AGENTS.md) holds the engineering rules and how to validate a
change.
