---
name: Tag a conversation
summary: Adds one or more existing tags to a conversation.
capability: classify-signals
docs: https://dev.frontapp.com/reference/add-conversation-tag
mcp: tag_conversation
api: POST /conversations/{conversation_id}/tags
updated: 2026-09-27
---

Pass tag IDs (`tag_...`), not names: `tag_ids` on the API, `addTags` on MCP,
where `removeTags` also takes tags off. Find tag IDs with `list_tags` on the
MCP server or `GET /tags` on the API.

Over MCP, connect with the client ID and secret of a Front developer app that
has MCP Server access: Front has no Dynamic Client Registration.
