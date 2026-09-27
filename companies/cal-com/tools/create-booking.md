---
name: Create a booking
summary: Books an attendee into a start time on an event type and returns the booking with its UID.
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/bookings/create-a-booking
mcp: create_booking
cli: calcom bookings create
api: POST /v2/bookings
updated: 2026-09-27
---

Name the event type by `eventTypeId`, or by `eventTypeSlug` plus `username`
(`teamSlug` for a team event), and pass `start` in UTC and the `attendee`'s
`name`, `email` and `timeZone`. Answer the event type's required booking
questions in `bookingFieldsResponses`, or the request fails with a 400. The
endpoint is public, so it can book on behalf of someone outside your
account. Send `cal-api-version: 2026-02-25`. The CLI takes `--event-type-id`,
`--start`, `--attendee-name`, `--attendee-email` and `--attendee-timezone`.
