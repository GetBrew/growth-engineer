---
name: Assign a conversation
summary: Assigns a conversation to a teammate, or unassigns it.
notes: Takes a teammate ID (`tea_...`), not a name, or null to unassign; find teammate IDs with `list_teammates` on the MCP server.
capability: route-alerts
docs: https://dev.frontapp.com/reference/update-conversation-assignee
mcp: assign_conversation
api: PUT /conversations/{conversation_id}/assignee
updated: 2026-09-27
---
