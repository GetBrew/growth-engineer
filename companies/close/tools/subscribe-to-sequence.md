---
name: Subscribe a contact to a sequence
summary: Enrolls a contact in a sequence (workflow), whose timed email and call steps run until the contact replies.
capability: send-email
docs: https://developer.close.com/api/resources/sequences/create-subscription
api: POST /sequence_subscription/
updated: 2026-09-27
---

The docs' example request names the sequence (`sequence_id`), the contact
(`contact_id` and `contact_email`), the sender (`sender_account_id`,
`sender_name` and `sender_email`) and `calls_assigned_to`, a list of user IDs.
Subscribing starts real outbound email: confirm the sequence, sender and
contact first. The MCP server can create a draft sequence
(`create_workflow`) but has no tool that subscribes contacts.
