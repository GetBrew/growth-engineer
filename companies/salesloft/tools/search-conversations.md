---
name: Search conversations
summary: Returns recorded calls and meetings in Salesloft, filtered by account, person, owner, platform, duration or date, each with its title, duration, account and person.
capability: review-recordings
docs: https://developers.salesloft.com/docs/api/conversations-find-all/
mcp: search_conversations
api: GET /v2/conversations
updated: 2026-09-27
---

Filter with `account_ids[]` or `person_ids[]` to review what was said with
one account or person. On the MCP server, `conversation_by_id` returns one
conversation's participants and messages. Over the API the call needs the
`conversations:read` scope, and pages hold up to 100 conversations.
