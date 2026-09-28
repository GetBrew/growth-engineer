---
name: Metabase
domain: metabase.com
category: product-analytics
tagline: "Open-source analytics: questions, dashboards and metrics on your own database."
docs: https://www.metabase.com/docs/latest/
github: https://github.com/metabase/metabase
mcp:
  url: https://{metabase_host}/api/metabase-mcp
  auth: oauth
  docs: https://www.metabase.com/docs/latest/ai/mcp
  notes: "`{metabase_host}` is your Metabase's address without `https://`. An admin turns the MCP server on under Admin > AI > MCP."
api:
  url: https://{metabase_host}
  auth: api_key
  env: METABASE_API_KEY
  header: X-API-Key
  docs: https://www.metabase.com/docs/latest/ai/agent-api
  notes: "`{metabase_host}` is your Metabase's address without `https://`; the key's group decides what it can read."
updated: 2026-09-27
---

Metabase is open-source analytics software that grounds every answer in your semantic layer (your metrics and business logic), so you can inspect the query behind it.

Each Metabase is served from its own address: replace `{metabase_host}` with it. An admin turns the MCP server on under Admin > AI > MCP, and it signs in with OAuth. API keys are created under Admin > Settings > Authentication > API keys; a key's group decides what it can read.
