---
name: Get available slots
summary: Returns the open start times of an event type between two dates, grouped by day.
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type
mcp: get_availability
cli: calcom slots available
api: GET /v2/slots
updated: 2026-09-27
---

Pass `start` and `end`, and name the event type by `eventTypeId` or by
`eventTypeSlug` plus `username` (`teamSlug` for a team event). Set
`timeZone` to get the times in the prospect's zone; the default is UTC. Offer
a few slots, then book the chosen one with `create_booking`. Send
`cal-api-version: 2024-09-04`.
