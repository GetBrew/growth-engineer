---
name: Send a transactional email
summary: Sends a published transactional email to one recipient, filled with the data variables you pass.
notes: Send an `Idempotency-Key` header so a retry never sends twice. Attachments work only after Loops support enables them.
capability: send-email
docs: https://loops.so/docs/api-reference/send-transactional-email
mcp: execute
cli: loops transactional send
api: POST /v1/transactional
updated: 2026-09-27
---
