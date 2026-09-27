---
name: Send an event
summary: Sends a named event for one contact, by contact ID or email address, and starts every automation that event triggers.
capability: send-email
docs: https://resend.com/docs/api-reference/events/send-event
mcp: send-event
cli: resend events send
api: POST /events/send
updated: 2026-09-27
---

Pass exactly one of `contact_id` or `email`; an email address with no contact
yet becomes one when the automation runs. The optional `payload` feeds the
automation's template variables and conditions, and is checked against the
event's schema when it has one.
