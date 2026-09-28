---
name: HubSpot
domain: hubspot.com
category: crm
tagline: Marketing, sales and service software on one customer platform, built around a shared CRM.
docs: https://developers.hubspot.com/docs
github: https://github.com/HubSpot
logo: hubspot.png
mcp:
  url: https://mcp.hubspot.com
  auth: oauth
  docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server
api:
  url: https://api.hubapi.com
  auth: api_key
  env: HUBSPOT_API_KEY
  docs: https://developers.hubspot.com/docs/api-reference/latest/overview
  notes: Use a service key or an app's static access token with the CRM scopes the calls need; paths carry a dated version such as `2026-09`.
updated: 2026-09-26
---

HubSpot's marketing, sales and service tools share one CRM of contacts, companies, deals and activities. Its hosted MCP server reads and writes CRM records with the signed-in user's permissions. The REST API takes a service key (in public beta) or an app's static access token as a Bearer token, and its current paths carry a dated version such as `2026-09`.
