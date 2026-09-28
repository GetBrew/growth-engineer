---
name: List bookings
summary: Returns bookings filtered by status, attendee, event type and date range, one page at a time.
notes: "Send `cal-api-version: 2026-05-01`. Filters take one `status` per request; page by passing `pagination.nextCursor` back as `cursor` until `hasMore` is false."
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/bookings/get-all-bookings
mcp: get_bookings
cli: calcom bookings list
api: GET /v2/bookings
updated: 2026-09-27
---
