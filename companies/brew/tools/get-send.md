---
name: Get a send
summary: Reads one campaign or automation send's current status, delivery accounting and lifetime engagement stats.
notes: 'Use the sendId returned by send-email. MCP takes report:{kind:"sends",sendId}. Queued is not delivered; inspect delivery accounting and recipient events before recording delivery. Stop polling when terminal or your execution window ends.'
capability: track-email-engagement
docs: https://docs.brew.new/api-reference/public-v1/sends/get-a-send
mcp: get_email_analytics
cli: brew-cli sends get
api: GET /v1/sends/{sendId}
updated: 2026-10-11
---
