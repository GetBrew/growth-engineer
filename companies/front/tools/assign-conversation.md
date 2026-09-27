---
name: Assign a conversation
summary: Assigns a conversation to a teammate, or unassigns it.
capability: route-alerts
docs: https://dev.frontapp.com/reference/update-conversation-assignee
mcp: assign_conversation
api: PUT /conversations/{conversation_id}/assignee
updated: 2026-09-27
---

Pass the teammate's ID (`tea_...`) as `assignee_id` on the API or `assigneeId`
on MCP, or null to unassign. On the MCP server, find teammate IDs with
`list_teammates`.

Over MCP, connect with the client ID and secret of a Front developer app that
has MCP Server access: Front has no Dynamic Client Registration.
