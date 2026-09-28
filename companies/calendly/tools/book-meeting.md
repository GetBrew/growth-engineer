---
name: Book a meeting
summary: Books an invitee into an open time on an event type and returns the invitee with links to cancel or reschedule.
notes: Needs a paid plan (Standard or above); the Free plan gets a 403. Take `start_time` in UTC from the event type's available times. Calendly sends the calendar invite and notifications as if the invitee had booked on the page.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/create-event-invitee
mcp: meetings-create_invitee
api: POST /invitees
updated: 2026-09-27
---
