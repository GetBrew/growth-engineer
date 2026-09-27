---
name: Airtable
domain: airtable.com
category: database
tagline: Build AI workflows, apps and agents on your team's shared data.
docs: https://airtable.com/developers
github: https://github.com/Airtable
logo: airtable.png
mcp:
  url: https://mcp.airtable.com/mcp
  auth: oauth
  docs: https://airtable.com/developers/agents/mcp/getting-started
cli:
  install: npm install -g @airtable/mcp-cli
  binary: airtable-mcp
  auth: api_key
  env: AIRTABLE_TOKEN
  keyUrl: https://airtable.com/create/tokens
  docs: https://airtable.com/developers/agents/mcp/cli
api:
  url: https://api.airtable.com
  auth: api_key
  env: AIRTABLE_TOKEN
  keyUrl: https://airtable.com/create/tokens
  docs: https://airtable.com/developers/web/api/introduction
updated: 2026-09-27
---

Airtable is a platform for building apps, workflows and agents on shared
data: a base holds tables of records, with interfaces, forms and automations
on top. Its MCP server, available on every plan, reads, creates and updates
records, builds bases, tables, interfaces and automations, and submits forms,
always within the permissions you already have. It signs in with OAuth; a
personal access token works too.

The `airtable-mcp` CLI runs the same MCP tools from a terminal, with hyphens
in place of underscores (`list_records_for_table` becomes
`airtable-mcp list-records-for-table`). Run `airtable-mcp tools` to see what
the server offers now: the CLI is experimental and tool names can change. One
personal access token, created with the scopes you need, serves both the CLI
and the Web API, which takes it as a bearer token. Record writes through MCP
and the CLI key fields by field id: read the ids with `get_table_schema`.
