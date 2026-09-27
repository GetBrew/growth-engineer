---
name: Create a broadcast
summary: Creates a marketing email to every subscribed contact in one segment, saved as a draft or, with send set to true, sent or scheduled at once.
capability: send-email
docs: https://resend.com/docs/api-reference/broadcasts/create-broadcast
mcp: create-broadcast
cli: resend broadcasts create
api: POST /broadcasts
updated: 2026-09-27
---

Pass `segment_id`, `from`, `subject` and `html` or `text`; contact properties
can personalize the body. Add `topic_id` to reach only the contacts subscribed
to that topic. On the MCP server `create-broadcast` only saves the draft: send
it with `send-broadcast`. A draft made without `send` goes out later with
`resend broadcasts send <id>` or `POST /broadcasts/:broadcast_id/send`.
