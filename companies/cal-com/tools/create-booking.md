---
name: Create a booking
summary: Books an attendee into a start time on an event type and returns the booking with its UID.
notes: "Send `cal-api-version: 2026-02-25` and `start` in UTC. Answer the event type's required booking questions in `bookingFieldsResponses`, or the request fails with a 400."
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/bookings/create-a-booking
mcp: create_booking
cli: calcom bookings create
api: POST /v2/bookings
updated: 2026-09-27
---
