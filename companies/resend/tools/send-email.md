---
name: Send an email
summary: Sends one email from a verified domain to up to 50 recipients, now or at a scheduled time, and returns its ID.
capability: send-email
docs: https://resend.com/docs/api-reference/emails/send-email
mcp: send-email
cli: resend emails send
api: POST /emails
updated: 2026-09-27
---

Pass `from`, `to`, `subject` and `html` or `text`, or a published `template`
with its variables. Send an `Idempotency-Key` header (`--idempotency-key` on
the CLI) so a retry never sends the email twice; keys expire after 24 hours.
`scheduled_at` takes an ISO 8601 time or plain words such as `in 1 min`.
