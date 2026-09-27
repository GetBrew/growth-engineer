---
name: Create a ticket
summary: Creates a support ticket from a first comment, with an optional subject, requester, priority, tags and custom fields, and returns the ticket.
capability: manage-tasks
docs: https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
api: POST /api/v2/tickets
updated: 2026-09-27
---

Send a `ticket` object whose only required property is `comment`; use
`html_body` instead of `body` for HTML. Set `requester` to an email or a name
and email: a requester who doesn't exist yet may be created, depending on
account settings. Send an `Idempotency-Key` header so a retry can't create a
duplicate ticket. Needs an agent's token.
