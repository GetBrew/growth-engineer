---
name: Search conversations
summary: Returns the conversations that match filters such as state, source type, author email, assignee or a word in the message body.
notes: Returns 20 conversations per page by default and at most 150, paged with `starting_after`. A `source.body` filter matches single words, not phrases.
capability: search-conversations
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/searchconversations
mcp: search_conversations
api: POST /conversations/search
updated: 2026-09-27
---
