# companies/

One folder per company, named by its **handle** — the permanent key that
becomes its URL (`/companies/clay`) and the first half of every tool key
(`clay/enrich-contacts`). Lowercase letters, digits and hyphens; 2–39
characters; not a reserved word (`tools`, `workflows`, `map`, …).

```
companies/<handle>/
  company.md            who they are: name, domain, category, links, description
  access/<id>.md        one WAY IN per file: the MCP server, the CLI, the API
  tools/<slug>.md       one FUNCTION per file: what an agent calls, and the exact operation per way in
```

Every file is a YAML header between `---` lines, then an optional markdown
body. Unknown fields are rejected, so a typo fails `pnpm content:check` with
the file's path instead of vanishing.

## company.md

The templates below describe a made-up company, Acme; copy one and replace
every value with your own. For real, published examples, open any folder
beside this README (`companies/clay/`, `companies/brew/`).

```markdown
---
name: Acme
domain: acme.example
category: data-provider          # a slug from tags/category/
tagline: Enrich people and companies from one API.
website: https://www.acme.example   # optional; defaults to https://<domain>
docs: https://docs.acme.example  # optional
github: https://github.com/acme  # optional
linkedin: https://www.linkedin.com/company/acme   # optional
x: https://x.com/acme            # optional
logo: acme.png                   # a file you add under public/logos/
founded: 2017                    # optional
headquarters: New York, NY       # optional
status: published                # or deprecated (still visible, with a warning)
updated: 2026-09-16
---

One or two paragraphs on what the company does. Optional. This is the
description on the company page and in the company's file.
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Display name. |
| `domain` | yes | Bare domain, no scheme. |
| `category` | yes | Must exist as `tags/category/<slug>.md`. |
| `logo` | yes | File name under `public/logos/`; png, jpg, svg or webp. |
| `updated` | yes | `YYYY-MM-DD` — the day these facts were last checked. |
| `tagline`, `website`, `docs`, `github`, `linkedin`, `x`, `founded`, `headquarters` | no | Shown when present. |
| `kind` | no | `vendor` (default), `open_source` or `individual`. |
| `aliases` | no | Old handles that should redirect here after a rename. |
| `status` | no | `published` (default) or `deprecated`. |

## access/\<id\>.md

A **way in** the company offers, shared by every tool of theirs that lists
it. The file name is the id a tool refers to; use `mcp`, `cli`, `api`, and a
suffix for a second option of the same type (`mcp-community`).

```markdown
---
type: mcp                        # mcp | cli | api
official: true                   # false = community-maintained; then set maintainer
transport: remote                # mcp only: remote | local
url: https://mcp.acme.example/mcp   # remote mcp
auth:
  method: oauth                  # none | api_key | oauth
  selfServe: true                # false = needs a sales call or approval
docsUrl: https://docs.acme.example/mcp
---
```

| `type` | Type-specific fields |
| --- | --- |
| `mcp` | `transport` (`remote` needs `url`; `local` needs `command`, e.g. `npx -y vendor-mcp`), `repoUrl?` |
| `cli` | `installCommand` (`brew install gh`), `binary` (`gh`), `repoUrl?` |
| `api` | `baseUrl`, `openApiUrl?` |

`auth` is the same shape for every type: `method`, `selfServe`, and for
`api_key` the `envVar` the agent should set (`ACME_API_KEY`), the `header`
when it is not `Authorization: Bearer`, and `keyUrl` where a person gets one.
The markdown body is optional and shown on the web only.

## tools/\<slug\>.md

**A tool is ONE function** — one thing an agent calls. The slug is the
capability it performs and must be a file under `tags/capability/`
(`enrich-contacts`, `send-email`, …); add the capability in the same pull
request if none fits. A product with three functions is three files.

```markdown
---
name: Enrich contacts
summary: Adds firmographic and person data to a contact or account.
access:
  mcp: acme_enrich_contacts      # <access id>: the exact operation for that way in
  api: POST /v1/enrich
updated: 2026-09-16
---

Optional longer description, shown on the tool page and in the file.
```

- `access` maps an id from `access/` to the **operation**: the MCP tool name,
  the CLI subcommand, or `METHOD /path` for an API — exactly as the vendor's
  docs name it. A published tool needs at least one; until it has one, set
  `status: draft` (a draft has no page and no file).
- `aliases` lists old slugs to redirect; `status` is `published`,
  `deprecated` or `draft`.

## Checking your work

```bash
pnpm content:check   # parses every file, resolves every reference, renders every file
pnpm dev             # then open /companies/<handle>
```
