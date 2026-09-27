---
name: Send a transactional email
summary: Sends a published transactional email to one recipient, filled with the data variables you pass.
capability: send-email
docs: https://loops.so/docs/api-reference/send-transactional-email
mcp: execute
cli: loops transactional send
api: POST /v1/transactional
updated: 2026-09-27
---

Pass `transactionalId` and `email`, plus `dataVariables` for the template
(`--var KEY=value` on the CLI). Set `addToAudience` to also create the
recipient as a contact, and send an `Idempotency-Key` header
(`--idempotency-key`) so a retry never sends twice. Attachments work only
after Loops support enables them. On the MCP server, find this operation with
`search`, check its request shape with `describe` and run it with `execute`.
