# Contributing

Everything in growth.engineer is a markdown file in this repository:
companies, tools, workflows and the tag vocabulary. The site, the `.md` files
agents fetch and the MCP server are all built from those files, so a
contribution is a pull request that adds or edits them.

## What you can add

| You want to | Add or edit | Fields and a template | An agent can do it with |
| --- | --- | --- | --- |
| Share a growth play | `workflows/<name>.md` | [`workflows/README.md`](workflows/README.md) | the [`add-workflow`](.agents/skills/add-workflow/SKILL.md) skill |
| Add a company and what an agent can call on it | `companies/<handle>/company.md`, `tools/<name>.md`, an optional `logo.svg` | [`companies/README.md`](companies/README.md) | the [`research-company`](.agents/skills/research-company/SKILL.md) skill |
| Fix a fact | the file that states it | the same READMEs | |

A new tag (a capability, category, channel or motion) goes in
[`tags.yml`](tags.yml), in the same pull request as the first file that uses
it. The top of that file explains each kind.

Can't open a pull request yourself?
[Open an issue](https://github.com/GetBrew/growth-engineer/issues/new/choose)
to request a company or propose a workflow.

## Check your work

You need Node 22+ and pnpm 11 (`corepack enable` installs the pinned pnpm).

```bash
pnpm install
pnpm content:check      # every problem in the catalog, each with its file (and line, in a workflow's body)
pnpm dev                # http://localhost:3000; add .md to a page's URL to see its file
```

CI runs the same check on every pull request, so you can also open one and
read the result there.

## Three rules worth knowing first

- **Keys are permanent.** A file or folder name is its URL. To rename one,
  list the old name under `aliases:` and the old URL redirects.
- **Nothing invented.** Every call, URL and fact comes from the vendor's own
  docs, and a tool's `docs:` links the page that names its call. If a fact is
  not public, leave the field out.
- **The build owns the format.** You write the facts and the steps; the build
  adds each tool's setup and the rules. Never edit a rendered file.

Everything else the build enforces is listed in
[`docs/data-model.md`](docs/data-model.md#rules-the-build-enforces).

## Pull requests

- One workflow, company or fix per pull request keeps review quick.
- Fill in the template: what you added, and how you checked the facts.
- Maintainers review for accuracy. The build takes care of formatting.
- By contributing, you agree that your contribution is licensed under the
  repository's [MIT license](LICENSE).

## Working on the site

The site is a Next.js app with a build-time catalog compiler and no backend.
Read [`AGENTS.md`](AGENTS.md) first: it has the rules the code follows and how
to validate a change. [`docs/setup.md`](docs/setup.md) covers the first run.

## Security and conduct

Report a vulnerability privately, as described in [`SECURITY.md`](SECURITY.md),
not in a public issue. Everyone taking part follows the
[code of conduct](CODE_OF_CONDUCT.md).
