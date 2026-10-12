---
name: Send an email
summary: "Queues a design from a verified marketing domain to a saved audience or up to 50 existing subscribed contacts, or sends a QA copy with test:true."
notes: "Supply subject and existing subscribed recipients. Use idempotency_key (MCP) or Idempotency-Key (HTTP), reusing it for retries. On confirmation_required, obtain approval and repeat with confirmed:true and the returned confirmation_id. Queued is not delivered."
capability: send-email
docs: https://docs.brew.new/api-reference/public-v1/emails/send-an-email
mcp: send_email
cli: brew-cli emails send
api: POST /v1/sends
updated: 2026-10-11
---
