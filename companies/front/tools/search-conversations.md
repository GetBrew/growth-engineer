---
name: Search conversations
summary: Returns the conversations that match search text and filters such as sender, contact, tag, inbox, assignee, status or date.
capability: research-accounts
docs: https://dev.frontapp.com/reference/search-conversations
mcp: search_conversations
api: GET /conversations/search/{query}
updated: 2026-09-27
---

On the API, URL-encode the query: search text plus filters such as `from:`
with an email address, `contact:`, `tag:` or `is:open`. Filters combine with
AND, up to 15 at once, and results come most recent activity first. The endpoint is limited to 40% of the company's rate limit. On
the MCP server, set `scope` to `all_inboxes` to include unassigned
conversations: the default searches only the caller's own.

Over MCP, connect with the client ID and secret of a Front developer app that
has MCP Server access: Front has no Dynamic Client Registration.
