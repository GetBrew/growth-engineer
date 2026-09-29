---
name: Make
domain: make.com
category: automation
tagline: Visual automation platform; run and build scenarios across 3,500+ apps from an agent.
docs: https://developers.make.com
github: https://github.com/integromat
logo: https://cdn.growth.engineer/icons/companies/make-9841d7a2.png
mcp:
  url: https://mcp.make.com
  auth: oauth
  docs: https://developers.make.com/mcp-server
cli:
  install: npm install -g @makehq/cli
  binary: make-cli
  auth: api_key
  env: MAKE_API_KEY
  docs: https://developers.make.com/make-cli
api:
  url: https://{zone_url}/api/v2
  auth: api_key
  env: MAKE_API_KEY
  scheme: Token
  docs: https://developers.make.com/api-documentation
  notes: "`{zone_url}` is your organization's zone from the Make dashboard's address bar, such as `eu1.make.com`."
updated: 2026-09-27
---

Make is a visual automation platform for building AI agents, agentic workflows
and integrations without writing code. Its workflows, called scenarios, connect
3,500+ pre-built apps or any service with an API. The hosted MCP server signs
in with OAuth, where you pick the organization and scopes: every active,
on-demand scenario becomes a tool on any plan, and on paid plans management
tools view and modify scenarios, connections, webhooks and data stores.

The `make-cli` CLI and the REST API take an API token created in your Make
profile; the API sends it as `Authorization: Token <token>`. `{zone_url}` is
the zone your organization is hosted in, such as `eu1.make.com` or
`us2.make.com`, as shown in your Make dashboard's address bar; the CLI reads it
from `MAKE_ZONE`.
