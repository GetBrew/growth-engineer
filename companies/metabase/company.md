---
name: Metabase
domain: metabase.com
category: product-analytics
tagline: "Open-source analytics: questions, dashboards and metrics on your own database."
docs: https://www.metabase.com/docs/latest/
github: https://github.com/metabase/metabase
logo: metabase.svg
mcp:
  url: https://{your-metabase-url}/api/metabase-mcp
  auth: oauth
  docs: https://www.metabase.com/docs/latest/ai/mcp
api:
  url: https://{your-metabase-url}
  auth: api_key
  env: METABASE_API_KEY
  header: X-API-Key
  docs: https://www.metabase.com/docs/latest/ai/agent-api
updated: 2026-09-27
---

Metabase is open-source analytics software that grounds every answer in your semantic layer (your metrics and business logic), so you can inspect the query behind it.

Each Metabase is served from its own address: replace `{your-metabase-url}` with it. An admin turns the MCP server on under Admin > AI > MCP, and it signs in with OAuth. API keys are created under Admin > Settings > Authentication > API keys; a key's group decides what it can read.
