---
name: Ask about an account
summary: Answers one plain-language question about a CRM account, such as its risks, objections or competitor mentions, from the calls and emails linked to it.
capability: research-accounts
docs: https://gong.app.gong.io/settings/api/documentation#get-/v2/entities/ask-entity
mcp: ask_account
api: GET /v2/entities/ask-entity
updated: 2026-09-27
---

Over the API, set `crmEntityType` to `ACCOUNT` and pass the account's CRM ID
as `crmEntityId`, the `workspaceId`, a `timePeriod` such as `LAST_90DAYS`, and
the `question`. An answer draws on at most 60 calls and 500 emails and
consumes Gong credits by the amount analyzed. Ask one focused question; for a
summary across several topics, generate a brief instead.
