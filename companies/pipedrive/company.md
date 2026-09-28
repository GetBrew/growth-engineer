---
name: Pipedrive
domain: pipedrive.com
category: crm
tagline: Sales CRM built around deals and pipelines.
docs: https://developers.pipedrive.com
github: https://github.com/pipedrive
mcp:
  url: https://mcp.pipedrive.ai/mcp
  auth: oauth
  docs: https://support.pipedrive.com/en/article/mcp
api:
  url: https://{company_domain}.pipedrive.com
  auth: api_key
  env: PIPEDRIVE_API_KEY
  header: x-api-token
  keyUrl: https://app.pipedrive.com/settings/api
  docs: https://developers.pipedrive.com/docs/api/v1
  notes: "`{company_domain}` comes from `GET https://api.pipedrive.com/v1/users/me`. Persons, organizations, deals and activities are on `/api/v2/`; leads and notes on `/api/v1/`."
updated: 2026-09-27
---

Pipedrive is a sales CRM for small and medium-sized businesses, built around
deals, leads, people, organizations, activities and notes. Its hosted MCP
server is on every plan, and its usage counts against the plan's token limits.
It signs in with OAuth, can only see and change what the signed-in user can,
and records every change in the change log.

The REST API takes the user's personal API token in the `x-api-token` header;
a user has one active token at a time. Each company has its own API host:
`GET https://api.pipedrive.com/v1/users/me` returns it as `company_domain`.
Persons, organizations, deals and activities are on `/api/v2/`; creating
leads and notes is still on `/api/v1/`.
