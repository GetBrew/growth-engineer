---
name: Send an email
summary: Sends one email from a verified domain to up to 50 recipients, now or at a scheduled time, and returns its ID.
notes: Pass an `Idempotency-Key` header (`--idempotency-key` on the CLI) so a retry never sends it twice; keys expire after 24 hours.
capability: send-email
docs: https://resend.com/docs/api-reference/emails/send-email
mcp: send-email
cli: resend emails send
api: POST /emails
updated: 2026-09-27
---
