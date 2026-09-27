---
name: Pipedrive
domain: pipedrive.com
category: crm
tagline: The easy-to-use sales CRM for small and medium-sized businesses.
docs: https://developers.pipedrive.com
github: https://github.com/pipedrive
logo: pipedrive.png
mcp:
  url: https://mcp.pipedrive.ai/mcp
  auth: oauth
  docs: https://support.pipedrive.com/en/article/mcp
api:
  url: https://{companydomain}.pipedrive.com
  auth: api_key
  env: PIPEDRIVE_API_KEY
  header: x-api-token
  keyUrl: https://app.pipedrive.com/settings/api
  docs: https://developers.pipedrive.com/docs/api/v1
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
