---
name: Create a ticket
summary: Creates a support ticket from a first comment, with an optional subject, requester, priority, tags and custom fields, and returns the ticket.
notes: Send an `Idempotency-Key` header so a retry can't create a duplicate ticket. A requester who doesn't exist yet may be created, depending on account settings. Needs an agent's token.
capability: manage-tasks
docs: https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
api: POST /api/v2/tickets
updated: 2026-09-27
---
