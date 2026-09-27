---
name: Instantly
domain: instantly.ai
category: sales-engagement
tagline: Automated email outreach with a B2B lead database, deliverability tools and an AI-powered CRM.
docs: https://developer.instantly.ai
logo: instantly.png
cli:
  install: npm install -g @instantlyai/cli
  binary: instantly
  auth: api_key
  env: INSTANTLY_API_KEY
  keyUrl: https://app.instantly.ai/app/settings/integrations
  docs: https://developer.instantly.ai/cli/quickstart
api:
  url: https://api.instantly.ai
  auth: api_key
  env: INSTANTLY_API_KEY
  keyUrl: https://app.instantly.ai/app/settings/integrations
  docs: https://developer.instantly.ai/getting-started/authorization
updated: 2026-09-27
---

Instantly runs cold email outreach: it connects and warms up sending
accounts, sends campaigns with sequences and subsequences, finds leads in its
SuperSearch B2B lead database, verifies email addresses, and keeps replies in
its Unibox inbox and CRM. API v2 takes a workspace API key as a Bearer token;
each key carries scopes, every path starts with `/api/v2`, and the workspace
shares a limit of 100 requests per second and 6,000 per minute. The
`instantly` CLI reads the same key from `INSTANTLY_API_KEY`.

Instantly also hosts an MCP server at `https://mcp.instantly.ai/mcp` with a
tool for every API v2 endpoint, named like `list_campaigns` or `create_lead`.
It authenticates with the API key in the `Authorization` header, and
`instantly mcp` runs a local MCP server from the CLI.
