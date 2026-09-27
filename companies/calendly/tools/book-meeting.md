---
name: Book a meeting
summary: Books an invitee into an open time on an event type and returns the invitee with links to cancel or reschedule.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/create-event-invitee
mcp: meetings-create_invitee
api: POST /invitees
updated: 2026-09-27
---

Pass the `event_type` URI, a `start_time` in UTC taken from the event type's
available times, and the `invitee`'s `email`, `timezone` and `name` (or
`first_name`). Include `location` with its `kind` only when the event type
sets a location, answer its required questions in `questions_and_answers`
with the exact question text, and add `tracking` UTM parameters to attribute
the meeting. Calendly sends the calendar invite and notifications as if the
invitee had booked on the page. Needs a paid plan (Standard or above): the
Free plan gets a 403.
