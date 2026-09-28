---
name: lemlist
domain: lemlist.com
category: sales-engagement
tagline: Sales engagement platform to find leads, enrich contacts and run multichannel outreach campaigns.
docs: https://developer.lemlist.com
github: https://github.com/l3mpire
mcp:
  url: https://app.lemlist.com/mcp
  auth: oauth
  docs: https://developer.lemlist.com/mcp/setup
cli:
  install: npm install -g @lemlist-official/cli
  binary: lemlist
  auth: oauth
  docs: https://developer.lemlist.com/cli/overview
api:
  url: https://api.lemlist.com/api
  auth: api_key
  env: LEMLIST_API_KEY
  scheme: Basic
  keyUrl: https://app.lemlist.com/settings/integrations
  docs: https://developer.lemlist.com/api-reference/getting-started/authentication
  notes: "`LEMLIST_API_KEY` holds the base64 of `:<api key>`, an empty username and the key; 20 requests every 2 seconds per key."
updated: 2026-09-27
---

lemlist is a sales engagement platform for cold outreach: it finds leads in
its people and companies databases, enriches them with verified emails and
phone numbers, runs multichannel campaigns across email, LinkedIn, phone and
WhatsApp, and keeps contacts and replies in its own CRM and inbox. The MCP
server and the `lemlist` CLI sign in with OAuth; the MCP server also accepts
an API key in an `X-API-Key` header, and `?bucket=` narrows the tools it
advertises. The CLI's `lemlist api <METHOD> <path>` calls any endpoint of the
REST API.

The REST API uses HTTP Basic auth with an empty username and the API key as
the password, so `LEMLIST_API_KEY` must hold the base64 encoding of `:`
followed by the key. Each key may send 20 requests every 2 seconds, and
enrichment spends the team's credits.
