---
name: Create a Single Send
summary: Creates an unscheduled draft marketing email for lists, segments or all contacts, with its content, sender and unsubscribe settings.
notes: "Needs a `sender_id` and a `suppression_group_id` or `custom_unsubscribe_url`. A `send_at` here only prefills the date: nothing sends until you schedule the Single Send."
capability: send-email
docs: https://www.twilio.com/docs/sendgrid/api-reference/single-sends/create-single-send
api: POST /v3/marketing/singlesends
updated: 2026-09-27
---
