---
name: List event invitees
summary: Returns the invitees of one scheduled event with their emails, booking-question answers, UTM tracking and no-show status.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/list-event-invitees
mcp: meetings-list_event_invitees
api: GET /scheduled_events/{uuid}/invitees
updated: 2026-09-27
---

Pass the scheduled event's `uuid`, the last part of its URI. Filter by
`status` or `email`; results come 20 per page in `created_at` order. Each
invitee's `questions_and_answers` holds what the booking form collected and
`tracking` holds its UTM parameters, ready to write to a CRM.
