---
name: Update a ticket
summary: Changes a ticket's status, priority, assignee, tags or fields, and can add a public reply or an internal note.
capability: manage-tasks
docs: https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-ticket
api: PUT /api/v2/tickets/{ticket_id}
updated: 2026-09-27
---

Send only the properties to change, in a `ticket` object. A `comment` with
`public: true` is a reply the requester can see; `public: false` is an
internal note. A ticket holds at most 5,000 comments. This endpoint has its
own rate limit, separate from the account-wide one, and returns 429 when it
runs out.
