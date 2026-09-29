---
name: monday.com
domain: monday.com
category: project-management
tagline: The AI work platform for people and agents, from projects to sales CRM and service.
docs: https://developer.monday.com/api-reference/docs
github: https://github.com/mondaycom
logo: https://cdn.growth.engineer/icons/companies/monday-03c5839f.png
mcp:
  url: https://mcp.monday.com/mcp
  auth: oauth
  docs: https://developer.monday.com/api-reference/docs/mondaycom-mcp
api:
  url: https://api.monday.com
  auth: api_key
  env: MONDAY_TOKEN
  header: Authorization
  docs: https://developer.monday.com/api-reference/docs/authentication
updated: 2026-09-27
---

monday.com is a work platform where teams run work management, sales CRM, dev
and service work on boards: each row is an item, and its columns hold typed
values such as a status, a date or an email. The hosted Platform MCP server
has more than 60 tools for boards, items, docs, forms, dashboards and
automations. It signs in with OAuth or takes a personal API token as a bearer
token, and every MCP call runs as a GraphQL API request that counts toward the
account's daily API call limit.

The API is GraphQL: every call is a `POST` to `https://api.monday.com/v2` with
a query or mutation in the body, and the personal API token goes in the
`Authorization` header as is. Find the token under your profile picture, then
Developers, then API token. Viewer seats can't use the API.
