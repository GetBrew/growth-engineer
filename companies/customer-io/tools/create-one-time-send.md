---
name: Create a one-time send
summary: Creates a one-time send (a newsletter) for a filter over segments and attributes or a CSV of recipients, as a draft, scheduled, or sent right away.
notes: Stays a draft unless you set `send_now` to `true` or `scheduled_at` to a future Unix timestamp. The name and audience can't change after creation, and a workspace with a subscription center requires `subscription_topic_id`.
capability: send-email
docs: https://docs.customer.io/integrations/api/app/tag/newsletters/createNewsletter/
mcp: cio_write_api
api: POST /v1/newsletters
updated: 2026-09-27
---
