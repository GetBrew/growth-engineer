---
name: Generate an email
summary: Generates an on-brand email design from a prompt; a ready result identifies the design and version, while a generating result needs polling.
notes: "Costs credits and requires a ready brand. If generating, poll get_email. Keep emailId and emailVersionId; pass both to a send or automation to pin the design."
capability: write-copy
docs: https://docs.brew.new/api-reference/public-v1/emails/generate-an-email-design
mcp: create_email
cli: brew-cli emails generate
api: POST /v1/emails
aliases:
  - brew/write-copy
updated: 2026-10-11
---
