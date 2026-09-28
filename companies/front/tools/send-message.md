---
name: Send a message
summary: Sends a message from a channel to its recipients right away; on the API this starts a new conversation.
notes: Sends for real. On MCP it sends a draft made with `create_draft`, which must have at least one recipient. The API token needs the Send permission, and the MCP connection the `send` scope.
capability: send-email
docs: https://dev.frontapp.com/reference/create-message
mcp: send_message
api: POST /channels/{channel_id}/messages
updated: 2026-09-27
---
