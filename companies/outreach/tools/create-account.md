---
name: Create an account
summary: Creates an account, the company record that groups prospects in Outreach, from a name, domain and other company fields, and returns its id.
notes: "Check for an existing account with `account_search` first. Prospects can't be written on the account: link each prospect to it through the prospect's `account` relationship."
capability: manage-crm
docs: https://developers.outreach.io/api/reference/account/paths/~1accounts/post
mcp: account_create
api: POST /accounts
updated: 2026-09-27
---
