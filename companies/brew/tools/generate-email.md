---
name: Generate an email
summary: Generates an on-brand email design from a plain-language prompt and returns its emailId, version id and HTML.
notes: Costs credits, and the brand must be ready first. Pass the returned `emailVersionId` to a send or an automation to pin that exact version.
capability: write-copy
docs: https://docs.brew.new/api-reference/public-v1/emails/generate-an-email-design
mcp: create_email
cli: brew-cli emails generate
api: POST /v1/emails
aliases:
  - brew/write-copy
updated: 2026-09-26
---
