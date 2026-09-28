# companies/

One folder per company, named by its **handle** — the permanent key that
becomes its URL (`/companies/apollo`) and the first half of every tool key
(`apollo/enrich-person`). Lowercase letters, digits and hyphens; 2–39
characters; not a reserved word (`tools`, `workflows`, `mcp`, …).

```
companies/<handle>/
  company.md            who they are, and how an agent reaches them: the MCP server, the CLI, the API
  logo.svg              optional: the logo (or logo.png, logo.jpg, logo.webp)
  tools/<name>.md       one FUNCTION per file: the call on each way in, and where it is documented
```

Every file is a YAML header between `---` lines; `company.md` may add a
markdown body, its description, and a tool file ends at its header. Unknown
fields are rejected, so a typo fails `pnpm content:check` with the file's
path instead of vanishing.

## company.md

The templates below describe a made-up company, Acme; copy one and replace
every value with your own. For real, published examples, open any folder
beside this README (`companies/stripe/`, `companies/brew/`).

```markdown
---
name: Acme
domain: acme.example
category: data-provider          # a category from tags.yml
tagline: Enrich people and companies from one API.
docs: https://docs.acme.example  # optional
github: https://github.com/acme  # optional
mcp:                             # optional: the MCP server
  url: https://mcp.acme.example/mcp   # or `command: npx -y acme-mcp` for a local one
  auth: oauth                    # none | oauth | api_key
  docs: https://docs.acme.example/mcp
cli:                             # optional: the command-line tool
  install: npm install -g acme-cli
  binary: acme
  auth: oauth
api:                             # optional: the HTTP API
  url: https://api.acme.example
  auth: api_key
  env: ACME_API_KEY              # where the key goes; required with api_key
  header: X-Api-Key              # optional: the header name; absent = Authorization: Bearer
  keyUrl: https://app.acme.example/settings/api   # optional
  docs: https://docs.acme.example/api
  notes: Keys are per workspace; test and live keys differ.   # optional, see below
status: published                # or deprecated (still visible, with a warning)
updated: 2026-09-16
---

One or two paragraphs on what the company does. Optional. This is the
description on the company page and in the company's file. It may use `###`
and smaller headings, never one named like a section the file writes (Tools,
Links, Set up, Rules…), and never a `---` or `===` underline.
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Display name. |
| `domain` | yes | Bare domain, no scheme. The website is always `https://<domain>`. |
| `category` | yes | Must be a `category:` entry in `tags.yml`. |
| `updated` | yes | `YYYY-MM-DD` — the day these facts were last checked. |
| `tagline`, `docs`, `github` | no | Shown when present. |
| `mcp`, `cli`, `api` | no | The ways in, at most one of each — see below. |
| `aliases` | no | Old handles that should redirect here after a rename. |
| `status` | no | `published` (default) or `deprecated`. |

### The logo

Optional: `logo.svg` beside `company.md` (or `logo.png`, `logo.jpg`,
`logo.webp`), at most 32 KB — an SVG, or a PNG at most 128px square. It is
served as is at `/logos/<handle>.<ext>`. Without one, the site draws the
name's first letter.

### Ways in: `mcp`, `cli`, `api`

How an agent reaches the company, written once and shared by every tool
below. Each way says how it authenticates:

| Way | Fields |
| --- | --- |
| `mcp` | exactly one of `url` (a remote server) or `command` (a local one, like `npx -y vendor-mcp`: plain words, no quotes) |
| `cli` | `install` (`brew install gh`) and `binary` (`gh`) |
| `api` | `url` (the base every call's path follows); `header` (a header name, like `X-Api-Key`) and `scheme` (the word before the key, like `Basic` or `Token`) when the key is not sent as `Authorization: Bearer` |

- `auth` is `none`, `oauth` or `api_key`. An API key names the environment
  variable it goes in (`env: ACME_API_KEY`) and, optionally, where a person
  gets one (`keyUrl`) — a file never holds a key. Only `api_key` takes `env`
  and `keyUrl`.
- A remote MCP server that takes an API key can't be set up from a file yet;
  list its API instead.
- `header` alone sends the key as is (`header: Authorization` sends
  `Authorization: $KEY`); `scheme` alone uses `Authorization` (`scheme: Basic`
  sends `Authorization: Basic $KEY`).
- A host that differs per account is a snake_case placeholder in braces, in a
  way's `url` only: `url: https://{subdomain}.zendesk.com/api/v2`. The way's
  `notes` must say where the value comes from.
- Basic auth is `scheme: Basic`, and the variable holds the base64 of the
  pair the docs define (`<key>:`, `<email>:<token>`); the way's `notes` say
  which.
- `notes` is one line of plain prose, at most 280 characters: what an agent
  must know to use this way — where a placeholder comes from, how a key is
  encoded, a setting an admin turns on first. It prints under the way in
  every tool and workflow file.
- `docs` links the way's own documentation. `maintainer: <who>` marks a
  community-run way; without it, the way is the vendor's own.

## tools/\<name\>.md

**A tool is ONE function** — one thing an agent calls. Name the file after
the function (`find-work-emails.md`, `create-payment-link.md`); the key is
`<handle>/<name>`. A product with three functions is three files.

```markdown
---
name: Enrich a person
summary: Returns work email, title and company for one person.
notes: Costs 1 credit per match; a request that finds nothing is free.   # optional
capability: enrich-contacts      # a capability from tags.yml
docs: https://docs.acme.example/api/people/enrich   # the page that names the call
mcp: enrich_person               # the MCP tool name, as the server lists it
api: POST /v1/people/enrich      # METHOD /path, as the API reference prints it
updated: 2026-09-16
---
```

- `name` is what the call does, starting with a verb, in sentence case:
  "Enrich a person", "Search people", "Add a lead to a campaign". Name the
  file after it (`enrich-person.md`).

- Each call — `mcp:`, `cli:`, `api:` — must be a way `company.md` declares,
  written exactly as the vendor's docs print it. A CLI call starts with the
  binary (`acme people enrich`); an API path puts its parameters in braces
  (`POST /contacts/{contact_id}/notes`).
- `capability` puts the tool on a shelf with every other vendor's version of
  the same job; add one to `tags.yml` in the same pull request if none fits.
- A published tool needs at least one call and `docs:`, the page that names
  it. Until it has both, set `status: draft` — a draft has no page and no
  file. A company whose tools are all drafts has no page either.
- A tool file is its header and nothing else: `summary` says what the call
  does; `notes`, when there is something to know before calling it, says it
  in one line of at most 280 characters — an id to fetch first, a result to
  poll for, a per-call limit, a cost. Every workflow that uses the tool
  prints its notes. A tool or company file renders to at most 80 lines.
- `aliases` lists old keys to redirect; `status` is `published`,
  `deprecated` or `draft`.

## Checking your work

```bash
pnpm content:check   # parses every file, resolves every reference, renders every file
pnpm dev             # then open /companies/<handle>, and /tools/<handle>/<name>.md for the file an agent gets
```
