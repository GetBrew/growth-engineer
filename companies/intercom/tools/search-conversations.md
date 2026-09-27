---
name: Search conversations
summary: Returns the conversations that match filters such as state, source type, author email, assignee or a word in the message body.
capability: research-accounts
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/searchconversations
mcp: search_conversations
api: POST /conversations/search
updated: 2026-09-27
---

Useful for reading a customer's support history before a call. The API returns
20 conversations per page by default and at most 150; page with
`starting_after`. A `source.body` filter matches single words, not phrases.
Read a full thread with `get_conversation` on the MCP server or
`GET /conversations/{conversation_id}` on the API.
