---
name: Search accounts
summary: Returns Salesloft accounts, the companies a team sells to, that match filters such as domain, name, owner, industry, tag or open opportunity.
capability: manage-crm
docs: https://developers.salesloft.com/docs/api/accounts-index/
mcp: search_accounts
api: GET /v2/accounts
updated: 2026-09-27
---

Filter by `domain` to find the account behind a company website, then read
the full record with `account_by_id` on the MCP server or
`GET /v2/accounts/:id` over the API. Results are paged with `per_page` and
`page`; pages past 100 cost extra against the rate limit.
