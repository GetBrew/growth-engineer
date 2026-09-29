---
name: Hunter
domain: hunter.io
category: data-provider
tagline: Find and verify professional email addresses, enrich people and companies, and run email outreach.
docs: https://hunter.io/api-documentation/v2
github: https://github.com/hunter-io
logo: https://cdn.growth.engineer/icons/companies/hunter-94c334ed.png
mcp:
  url: https://mcp.hunter.io/mcp
  auth: oauth
  docs: https://hunter.io/mcp
api:
  url: https://api.hunter.io/v2
  auth: api_key
  env: HUNTER_API_KEY
  header: X-API-Key
  keyUrl: https://hunter.io/api-keys
  docs: https://hunter.io/api-documentation/v2
updated: 2026-09-27
---

Hunter finds and verifies professional email addresses: it lists the people
and emails behind a company domain, finds one person's email, checks
deliverability, discovers companies that match a profile, enriches people and
companies, and runs outreach sequences from saved leads. The hosted MCP server
covers all of it; Claude, ChatGPT and Gemini sign in with OAuth, and other
clients send the API key in an `X-API-Key` header. The REST API accepts the
key in that header, as a Bearer token, or as the `api_key` query parameter.

Every plan, including the free one, can use the API and the MCP server. Usage
counts against the plan's credits: a search uses 1 credit and a verification
half a credit, while Discover (company search) is free.
