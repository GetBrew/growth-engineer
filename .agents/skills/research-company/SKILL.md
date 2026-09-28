---
name: research-company
description: Research a company from its domain and write its growth.engineer catalog files — companies/<handle>/company.md (who they are and how an agent connects: MCP server, CLI, API) and up to five companies/<handle>/tools/<function>.md (documented go-to-market calls) — from the vendor's own docs, with a source for every fact. Use when asked to add a company or domain to the catalog, to find a company's MCP tools or API endpoints, or to re-check an existing company's files.
---

# Research a company

Turns a domain into catalog files an agent can run. The file format is defined in
`companies/README.md` — read it first and copy its templates; this skill only says
how to find the facts. Every fact you write must be on a page you fetched.

**Input:** one or more domains (`stripe.com`). In **bulk mode** (the caller says so)
you don't edit `tags.yml` or `workflows/` and you don't run `pnpm content:check` —
report instead; the caller merges and checks the batch.
**Output:** the files, a logo, and a report (step 6).

## 1. Place the company

- The handle is the brand in kebab-case (`stripe`, `customer-io`), following the
  handle rules in `companies/README.md`.
- If `companies/<handle>/` exists, you are updating it: re-verify every fact.
  Rename a tool file whose name isn't its function (`enrich-contacts.md` →
  `enrich-person.md`), list the old key under `aliases:` so its URL redirects,
  and report the rename; delete a tool whose call doesn't exist and report it —
  the caller relinks any workflow step that used it.

## 2. Find how an agent connects

Only official sources count: the vendor's domains, its docs site, its GitHub
organization. Never blogs, directories, marketplaces or third-party servers.

- **MCP.** Search the vendor's docs for "MCP" (`WebSearch` with
  `allowed_domains: [<domain>, docs.<domain>]`).
  - The MCP Registry (`https://registry.modelcontextprotocol.io/v0/servers?search=<brand>`)
    can point to a server; an entry counts only when its namespace is the vendor's
    reverse domain (`com.stripe/mcp`) or a GitHub org the vendor's docs link to.
  - Match by domain, never by name: `apollo` returns Apollo GraphQL, not Apollo.io.
  - The registry is incomplete — no entry doesn't mean no server.
  - Record the remote `url` (or local `command`), the auth, and the tool names exactly
    as the vendor lists them. A remote server that takes an API key can't be written
    yet: note it and use the API.
  - Never write a URL that carries a secret (a per-user MCP link with a token in it).
- **API.** From the API reference: the base `url`, the auth (`none`, `oauth`,
  `api_key` with the `env` var — the docs' name, else `<BRAND>_API_KEY` — plus
  `header` and `scheme` when it isn't `Authorization: Bearer`), and the `keyUrl`
  where a key is created. A host that differs per account is a snake_case
  placeholder in braces (`https://{subdomain}.zendesk.com/api/v2`), and the way's
  `notes` say where the value comes from; Basic auth's `notes` say which pair the
  variable encodes.
- **Way notes.** Anything an agent must know to use a way at all — a setting an
  admin turns on first, a regional host — goes in that way's `notes` (one line,
  at most 280 characters).
- **CLI.** From the CLI docs: the `install` command and the `binary`.

## 3. Choose up to five functions

- Go-to-market work only — what a growth workflow does: find or enrich people and
  companies, create or update CRM records, send email or messages, book meetings,
  track events, collect payments, research accounts, write copy. Each maps to one
  `capability` in `tags.yml`; in bulk mode, propose a new one instead of adding it.
- One file = one function. Name the file after it (`create-payment-link.md`,
  `enrich-person.md`), never after the capability.
- For each: the exact call on every way in that has it, as the docs print it — the
  MCP tool name, the CLI command (starting with the binary), `METHOD /path` for the
  API — and `docs:`, the page that names the call. Prefer functions reachable over
  MCP.
- Two tools whose calls are all the same are one tool. A generic MCP tool that
  takes the endpoint as an argument (`stripe_api_read`) may serve several tools
  whose API calls differ; each tool's `api:` names the endpoint it runs.
- A tool file is its header alone — no body. `summary` says what the call does;
  `notes` holds what an agent must know before calling it — an id to fetch
  first, a result to poll for, a per-call limit, a cost, a side effect — in one
  line of at most 280 characters. Leave `notes` out when there is nothing to know.

## 4. Write the files

- Copy the templates in `companies/README.md`; `updated` is today.
- `name` says what the function does, starting with a verb ("Enrich a person",
  "Search people", "Create or update a contact"); `summary` is one plain sentence
  about what the call returns or changes — never "<Company> does this".
- Leave out anything you couldn't confirm on an official page. A tool whose call
  you couldn't confirm gets `status: draft` — it stays out of the site.

## 5. Logo

Keep an existing logo. For a new company: read the homepage's `<link rel="icon">`
tags — prefer an SVG, then the apple-touch-icon, then a PNG of at least 64 px (a
vendor CDN the homepage links is fine; `/apple-touch-icon.png` is often a 404) —
download it, check it's an image (`file`) under 32 KB (`wc -c`), and save it as
`companies/<handle>/logo.<ext>` (svg, png, jpg or webp). If nothing fits, leave
it out — the logo is optional — and say so.

## 6. Report

For each company:

- files written, renamed (old key → new key) and deleted
- a table: fact → the official URL it came from, notes included
- drafts, and why
- tags proposed for `tags.yml` (namespace, slug, label, synonyms)
- anything gated: a sales-only API, a waitlisted or key-only MCP server

Outside bulk mode, finish with `pnpm content:check` and fix what it lists.

## Never

- Invent a call, URL, env var, tool name or fact.
- Use a third-party server, wrapper or aggregator as a company's way in.
- Print or paste an API key.
- Edit rendered output or app code.
