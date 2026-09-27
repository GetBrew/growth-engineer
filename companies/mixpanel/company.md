---
name: Mixpanel
domain: mixpanel.com
category: product-analytics
tagline: Product analytics, session replay, experiments and feature flags on your event data.
docs: https://docs.mixpanel.com
github: https://github.com/mixpanel
logo: mixpanel.jpg
mcp:
  url: https://mcp.mixpanel.com/mcp
  auth: oauth
  docs: https://docs.mixpanel.com/docs/mcp
cli:
  install: pip install mixpanel-headless
  binary: mp
  auth: oauth
  docs: https://docs.mixpanel.com/docs/mixpanel-headless
api:
  url: https://mixpanel.com/api/query
  auth: api_key
  env: MIXPANEL_SA_TOKEN
  header: "Authorization: Basic"
  keyUrl: "https://mixpanel.com/settings/org#serviceaccounts"
  docs: https://docs.mixpanel.com/reference/query-api
updated: 2026-09-26
---

Mixpanel is a product intelligence platform that combines event analytics (insights, funnels, flows and retention), session replay, experiments, feature flags and AI-powered insights.

The URLs above are for US projects. EU and India projects use `https://mcp-eu.mixpanel.com/mcp` and `https://mcp-in.mixpanel.com/mcp` for MCP, and `https://eu.mixpanel.com/api/query` and `https://in.mixpanel.com/api/query` for the Query API. The Query API authenticates with a service account: `MIXPANEL_SA_TOKEN` holds the base64 of `<username>:<secret>`, and every request carries `project_id`.
