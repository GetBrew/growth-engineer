---
name: Search conversations
summary: Returns the conversations that match search text and filters such as sender, contact, tag, inbox, assignee, status or date.
notes: "On MCP, set `scope` to `all_inboxes`: the default searches only the caller's own conversations. Up to 15 filters, combined with AND; the API endpoint is limited to 40% of the company's rate limit."
capability: search-conversations
docs: https://dev.frontapp.com/reference/search-conversations
mcp: search_conversations
api: GET /conversations/search/{query}
updated: 2026-09-27
---
