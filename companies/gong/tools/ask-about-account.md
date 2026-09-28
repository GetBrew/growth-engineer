---
name: Ask about an account
summary: Answers one plain-language question about a CRM account, such as its risks, objections or competitor mentions, from the calls and emails linked to it.
notes: Each answer spends Gong credits by the amount analyzed and draws on at most 60 calls and 500 emails. Over the API, pass the account's CRM ID as `crmEntityId` with a `workspaceId`; for several topics, generate a brief instead.
capability: research-accounts
docs: https://gong.app.gong.io/settings/api/documentation#get-/v2/entities/ask-entity
mcp: ask_account
api: GET /v2/entities/ask-entity
updated: 2026-09-27
---
