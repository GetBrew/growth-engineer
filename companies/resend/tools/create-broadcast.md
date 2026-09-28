---
name: Create a broadcast
summary: Creates a marketing email to every subscribed contact in one segment, saved as a draft or, with send set to true, sent or scheduled at once.
notes: "Over MCP it only saves the draft: send it with `send-broadcast`. A draft made without `send` goes out later with `POST /broadcasts/{broadcast_id}/send` or `resend broadcasts send <id>`."
capability: send-email
docs: https://resend.com/docs/api-reference/broadcasts/create-broadcast
mcp: create-broadcast
cli: resend broadcasts create
api: POST /broadcasts
updated: 2026-09-27
---
