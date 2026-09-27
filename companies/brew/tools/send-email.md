---
name: Send an email
summary: Sends an email design as a campaign to a saved audience or an inline recipient list through a verified domain, or one test copy with test set to true.
capability: send-email
docs: https://docs.brew.new/api-reference/public-v1/emails/send-an-email
mcp: send_email
cli: brew-cli emails send
api: POST /v1/sends
updated: 2026-09-26
---

Always pass an idempotency key. On OAuth and organization MCP connections a
real send first returns `confirmation_required`; call again with
`confirmed: true` once the user approves. Every recipient of a marketing
send must have opted in: Brew does not permit cold outreach.
