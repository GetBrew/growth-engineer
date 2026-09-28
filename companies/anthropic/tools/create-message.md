---
name: Create a message
summary: Returns Claude's next message for a prompt or conversation, such as a drafted email or a label for a record.
notes: "The API call needs the `anthropic-version: 2023-06-01` header alongside the key, and `max_tokens` is required in the body."
capability: write-copy
docs: https://platform.claude.com/docs/en/api/messages/create
cli: claude -p
api: POST /v1/messages
aliases:
  - anthropic/write-copy
  - anthropic/classify-signals
updated: 2026-09-26
---
