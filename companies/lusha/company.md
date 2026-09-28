---
name: Lusha
domain: lusha.com
category: data-provider
tagline: Verified B2B emails, phone numbers and buying signals for prospecting and enrichment.
docs: https://docs.lusha.com
github: https://github.com/lusha-oss
mcp:
  url: https://mcp.lusha.com
  auth: oauth
  docs: https://docs.lusha.com/mcp-docs
api:
  url: https://api.lusha.com
  auth: api_key
  env: LUSHA_API_KEY
  header: api_key
  keyUrl: https://dashboard.lusha.com/enrich/api
  docs: https://docs.lusha.com/apis/openapi
updated: 2026-09-27
---

Lusha is a B2B data platform for prospecting and enrichment: verified emails,
direct and mobile phone numbers, company firmographics, and signals such as
job changes, promotions, hiring surges and funding news. Its MCP server finds
and enriches contacts and companies, searches by ideal customer profile,
finds lookalikes and returns signals and scored recommendations.

The MCP server signs in with OAuth; a client without OAuth can send a Lusha
API key in the `x-api-key` header instead. The REST API (version 3, under
`https://api.lusha.com/v3/`) takes the key in an `api_key` header. Searches
return previews without emails or phones. Credits are charged per search
result, per revealed email or phone and per matched signal, and failed
lookups are not charged.
