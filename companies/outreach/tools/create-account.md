---
name: Create an account
summary: Creates an account, the company record that groups prospects in Outreach, from a name, domain and other company fields, and returns its id.
capability: manage-crm
docs: https://developers.outreach.io/api/reference/account/paths/~1accounts/post
mcp: account_create
api: POST /accounts
updated: 2026-09-27
---

Over the API, send `data.type` set to `account` with `name` and fields such
as `domain` under `data.attributes`. An account's `prospects` can't be
written directly: create or update each prospect with an `account`
relationship pointing at the new account. On the MCP server, check for an
existing account with `account_search` first.
