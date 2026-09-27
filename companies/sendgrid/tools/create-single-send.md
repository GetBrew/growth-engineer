---
name: Create a Single Send
summary: Creates an unscheduled draft marketing email for lists, segments or all contacts, with its content, sender and unsubscribe settings.
capability: send-email
docs: https://www.twilio.com/docs/sendgrid/api-reference/single-sends/create-single-send
api: POST /v3/marketing/singlesends
updated: 2026-09-27
---

Set `send_to` (`list_ids`, `segment_ids` or `all`) and `email_config`: the
subject and HTML, or a `design_id`, the `sender_id`, and a
`suppression_group_id` or `custom_unsubscribe_url`. A `send_at` here only
prefills the date; schedule the Single Send to send it.
