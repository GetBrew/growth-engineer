---
name: Cal.com
domain: cal.com
category: scheduling
tagline: Open-source scheduling software, with booking pages for people and a scheduling API for apps.
docs: https://cal.com/docs
github: https://github.com/calcom
mcp:
  url: https://mcp.cal.com/mcp
  auth: oauth
  docs: https://cal.com/docs/mcp-server
cli:
  install: npm install -g @calcom/cli
  binary: calcom
  auth: api_key
  env: CAL_API_KEY
  keyUrl: https://app.cal.com/settings/developer/api-keys
  docs: https://cal.com/docs/agents
api:
  url: https://api.cal.com
  auth: api_key
  env: CAL_API_KEY
  keyUrl: https://app.cal.com/settings/developer/api-keys
  docs: https://cal.com/docs/api-reference/v2/introduction
updated: 2026-09-27
---

Cal.com is open-source scheduling software for individuals, businesses that
take calls, and developers building scheduling into their own products. Its
hosted MCP server, the `calcom` CLI and API v2 check availability, create,
reschedule and cancel bookings, and manage event types, schedules and
private booking links.

The MCP server signs in with OAuth 2.1. The CLI and the API take an API key
(`cal_live_` in live mode, `cal_` in test mode) as a Bearer token: run
`calcom login` once, or set `CAL_API_KEY`. Every API v2 request needs the
`cal-api-version` header, set to the version its endpoint's reference names.
Checking slots and creating a booking are public and need no key.
