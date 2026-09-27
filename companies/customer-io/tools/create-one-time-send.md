---
name: Create a one-time send
summary: Creates a one-time send (a newsletter) for a filter over segments and attributes or a CSV of recipients, as a draft, scheduled, or sent right away.
capability: send-email
docs: https://docs.customer.io/integrations/api/app/tag/newsletters/createNewsletter/
mcp: cio_write_api
api: POST /v1/newsletters
updated: 2026-09-27
---

Set the audience with `recipients` or `recipient_file_url`, never both. Set
`send_now` to `true` to send at once, or `scheduled_at` to a future Unix
timestamp; with neither it stays a draft. The name and audience can't change
after creation. If the workspace has a subscription center,
`subscription_topic_id` is required. On the MCP server, find the endpoint with
`cio_schema` and call it with `cio_write_api`.
