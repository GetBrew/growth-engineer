---
name: List event invitees
summary: Returns the invitees of one scheduled event with their emails, booking-question answers, UTM tracking and no-show status.
notes: Takes the scheduled event's `uuid`, the last part of its URI. Results come 20 per page.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/list-event-invitees
mcp: meetings-list_event_invitees
api: GET /scheduled_events/{uuid}/invitees
updated: 2026-09-27
---
