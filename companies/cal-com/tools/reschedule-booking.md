---
name: Reschedule a booking
summary: Moves an accepted or pending booking to a new start time and returns the rescheduled booking.
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/bookings/reschedule-a-booking
mcp: reschedule_booking
cli: calcom bookings reschedule
api: POST /v2/bookings/{bookingUid}/reschedule
updated: 2026-09-27
---

Pass the booking's UID and the new `start` in UTC, after checking the time
is open with `get_availability`. A pending booking stays pending until the
host confirms it. Cancelled, rejected and live instant bookings can't be
rescheduled and return a 400: create a new booking instead. Send
`cal-api-version: 2026-02-25`.
