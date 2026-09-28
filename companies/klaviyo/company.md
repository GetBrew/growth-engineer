---
name: Klaviyo
domain: klaviyo.com
category: email
tagline: Email and SMS marketing on a B2C CRM, with profiles, events, campaigns and flows.
docs: https://developers.klaviyo.com/en
github: https://github.com/klaviyo
mcp:
  url: https://mcp.klaviyo.com/mcp
  auth: oauth
  docs: https://developers.klaviyo.com/en/docs/klaviyo_mcp_server
cli:
  install: go install github.com/klaviyo/klaviyo-cli/cmd/klaviyo@latest
  binary: klaviyo
  auth: api_key
  env: KLAVIYO_API_KEY
  keyUrl: https://www.klaviyo.com/create-private-api-key
  docs: https://developers.klaviyo.com/en/docs/klaviyo_cli
api:
  url: https://a.klaviyo.com
  auth: api_key
  env: KLAVIYO_API_KEY
  scheme: Klaviyo-API-Key
  keyUrl: https://www.klaviyo.com/create-private-api-key
  docs: https://developers.klaviyo.com/en/reference/api_overview
updated: 2026-09-27
---

Klaviyo is a B2C marketing platform: profiles and the events they generate
drive email and SMS campaigns, automated flows, lists and segments.

The remote MCP server signs in with OAuth and is open to Owner, Admin and
Manager roles; add `read-only=true` to its URL to turn off every tool that
writes. The `klaviyo` CLI has a command for every JSON API operation and
takes a private API key (`pk_...`). The API takes that key as
`Authorization: Klaviyo-API-Key <key>` plus a `revision` header with the API
version date, such as `2026-07-15`; the CLI sends both for you.
