---
name: 6sense
domain: 6sense.com
category: intent
tagline: The ABM platform powered by revenue intelligence, with buying signals, predictive buying stages and B2B people and company data.
docs: https://support.6sense.com
logo: https://cdn.growth.engineer/icons/companies/6sense-eb45fd32.svg
mcp:
  url: https://api.6sense.com/mcp
  auth: oauth
  docs: https://support.6sense.com/docs/6sense-model-context-protocol-mcp-1
api:
  url: https://api.6sense.com
  auth: api_key
  env: SIXSENSE_API_KEY
  scheme: Token
  keyUrl: https://abm.6sense.com/login?redirect=%2Fsettings%2Fintegration%2Fapitokenmanagement
  docs: https://api.6sense.com/docs/
updated: 2026-09-27
---

6sense captures anonymous buying signals across the buyer's journey,
predicts each account's buying stage, and supplies B2B people and company
data to revenue teams.

The hosted MCP server is read-only and signs in each user with OAuth. It
answers questions about account insights, 6QA trends, keyword intent, website
activity, ad campaign performance and segments, and with Sales Intelligence
it finds and unlocks contacts. 6sense's docs don't list the server's tool
names; the agent discovers them after connecting. An admin must first turn on
MCP under Settings, AI and MCP (it is off by default), and what each user can
ask depends on their Revenue Marketing or Sales Intelligence license.

The REST API takes a 40-character API token in `Authorization: Token`.
Tokens are created in Settings, API Token management, and each works only for
the APIs of its group; enrichment calls spend 6sense Credits allocated to API
(Enrichment). The API allows 100 requests a minute. The Company
Identification and Lead Scoring APIs run on other hosts
(`epsilon.6sense.com`, `scribe.6sense.com`) and aren't covered here.
