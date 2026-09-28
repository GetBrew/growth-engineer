---
name: Tag a conversation
summary: Adds one or more existing tags to a conversation.
notes: "Takes tag IDs (`tag_...`), not names: find them with `list_tags` on the MCP server or `GET /tags` on the API."
capability: classify-signals
docs: https://dev.frontapp.com/reference/add-conversation-tag
mcp: tag_conversation
api: POST /conversations/{conversation_id}/tags
updated: 2026-09-27
---
