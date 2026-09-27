---
name: Send a message
summary: Sends a message from a channel to its recipients right away; on the API this starts a new conversation.
capability: send-email
docs: https://dev.frontapp.com/reference/create-message
mcp: send_message
api: POST /channels/{channel_id}/messages
updated: 2026-09-27
---

The API sends in one call: pass `to` (recipient handles) and `body`, plus a
`subject` for email. It answers `202` with a `message_uid` you can use to
check that the message was created. On the MCP server, `send_message` sends a
draft made with `create_draft`, which must have at least one recipient. The
API token needs the Send permission, and the MCP connection the `send` scope.

Over MCP, connect with the client ID and secret of a Front developer app that
has MCP Server access: Front has no Dynamic Client Registration.
