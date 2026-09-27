---
name: Create a campaign
summary: Creates a draft marketing campaign with an empty email message, optionally aimed at a mailing list, segment or filter and scheduled.
capability: send-email
docs: https://loops.so/docs/api-reference/create-campaign
mcp: execute
cli: loops campaigns create
api: POST /v1/campaigns
updated: 2026-09-27
---

Write the email's subject, sender, preview text and LMX content through the
returned `emailMessageId` (`loops email-messages update` on the CLI).
`scheduling` (`--schedule-at` or `--schedule-now`) sets when the campaign
sends once it is published. On the MCP server, `search`, `describe` and
`execute` find, inspect and run this operation.
