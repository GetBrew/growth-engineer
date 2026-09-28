---
name: Update a ticket
summary: Changes a ticket's status, priority, assignee, tags or fields, and can add a public reply or an internal note.
notes: "A `comment` with `public: true` is a reply the requester can see; `public: false` makes it an internal note. This endpoint has its own rate limit and returns 429 when it runs out."
capability: manage-tasks
docs: https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-ticket
api: PUT /api/v2/tickets/{ticket_id}
updated: 2026-09-27
---
