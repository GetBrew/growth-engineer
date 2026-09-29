---
name: Close
domain: close.com
category: crm
tagline: The CRM with a built-in AI teammate that calls leads, qualifies prospects, books meetings and keeps the CRM up to date.
docs: https://developer.close.com
github: https://github.com/closeio
logo: https://cdn.growth.engineer/icons/companies/close-95f67709.png
mcp:
  url: https://mcp.close.com/mcp
  auth: oauth
  docs: https://developer.close.com/mcp
api:
  url: https://api.close.com/api/v1
  auth: api_key
  env: CLOSE_API_KEY
  scheme: Basic
  docs: https://developer.close.com/api/overview
  notes: "`CLOSE_API_KEY` holds the base64 of `<api key>:`, the key with a trailing colon."
updated: 2026-09-27
---

In Close, the central record is the lead: a company or organization that
holds the contacts (people) you sell to, plus their opportunities, tasks and
activities such as calls, emails and notes.

The hosted MCP server signs in with OAuth and supports Dynamic Client
Registration. The scope granted at sign-in decides its tools: `mcp.read` only
reads, `mcp.write_safe` also creates records, and `mcp.write_destructive` also
updates and deletes them. The REST API uses HTTP Basic auth with an API key as
the username and an empty password, so `CLOSE_API_KEY` holds the base64 of
the key followed by a colon (`<key>:`). Keys are created per user and
organization in Close under Settings, Developer, API Keys.
