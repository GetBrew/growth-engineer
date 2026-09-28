---
name: Create a campaign
summary: Creates a draft marketing campaign with an empty email message, optionally aimed at a mailing list, segment or filter and scheduled.
notes: "The email message starts empty: write its subject, sender, preview text and LMX content through the returned `emailMessageId`. `scheduling` sets when the campaign sends once it is published."
capability: send-email
docs: https://loops.so/docs/api-reference/create-campaign
mcp: execute
cli: loops campaigns create
api: POST /v1/campaigns
updated: 2026-09-27
---
