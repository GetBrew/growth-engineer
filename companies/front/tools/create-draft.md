---
name: Draft a new message
summary: Creates an unsent draft that starts a new conversation from a channel, for a teammate to review and send.
notes: "Needs a channel ID: list them with `list_channels`. On MCP leave out `conversationId`, which drafts a reply instead. Set `mode` to `shared` on the API, or `shared` to true on MCP, so teammates can see the draft."
capability: send-email
docs: https://dev.frontapp.com/reference/create-draft
mcp: create_draft
api: POST /channels/{channel_id}/drafts
updated: 2026-09-27
---
