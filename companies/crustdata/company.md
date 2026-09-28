---
name: Crustdata
domain: crustdata.com
category: data-provider
tagline: Real-time company and people data for AI agents, from search to enrichment and contact details.
docs: https://docs.crustdata.com
mcp:
  url: https://install.crustdata.com/mcp
  auth: oauth
  docs: https://docs.crustdata.com/for-agents/mcp
cli:
  install: curl -fsSL https://static-assets.crustdata.com/cli/install.sh | sh
  binary: crustdata
  auth: api_key
  env: CRUSTDATA_API_KEY
  keyUrl: https://app.crustdata.com/api-keys
  docs: https://docs.crustdata.com/for-agents/cli
api:
  url: https://api.crustdata.com
  auth: api_key
  env: CRUSTDATA_API_KEY
  keyUrl: https://app.crustdata.com/api-keys
  docs: https://docs.crustdata.com/openapi-specs/2025-11-01/introduction
updated: 2026-09-27
---

Crustdata provides a real-time B2B data API for AI agents, covering people
and companies for sales, recruiting and investment workflows. Its Company,
Person, Job, Web and Social Post APIs search, identify and enrich records,
and watches deliver newly matching records on a schedule. Pin every API
request to a version with the `x-api-version: 2025-11-01` header; some
endpoints and fields depend on the plan.

The MCP server's tool names aren't published, so the tools below name only
their API or CLI calls; the server lists its own once connected.
