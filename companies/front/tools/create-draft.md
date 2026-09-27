---
name: Draft a new message
summary: Creates an unsent draft that starts a new conversation from a channel, for a teammate to review and send.
capability: send-email
docs: https://dev.frontapp.com/reference/create-draft
mcp: create_draft
api: POST /channels/{channel_id}/drafts
updated: 2026-09-27
---

Pass `body` and the recipients in `to`, `cc` or `bcc`. On the MCP server, give
`create_draft` a `channelId` and no `conversationId` (with a `conversationId`
it drafts a reply instead); list channel IDs with `list_channels`. Set `mode`
to `shared` on the API, or `shared` to true on MCP, so teammates can see the
draft.

Over MCP, connect with the client ID and secret of a Front developer app that
has MCP Server access: Front has no Dynamic Client Registration.
