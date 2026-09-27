---
name: List bookings
summary: Returns bookings filtered by status, attendee, event type and date range, one page at a time.
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/bookings/get-all-bookings
mcp: get_bookings
cli: calcom bookings list
api: GET /v2/bookings
updated: 2026-09-27
---

Filter by one `status` per request (`upcoming`, `past`, `cancelled`,
`recurring` or `unconfirmed`), by `attendeeEmail` to see whether a prospect
has booked, and by `afterStart` and `beforeEnd`. Over the API, send
`cal-api-version: 2026-05-01` and page with a cursor: pass
`pagination.nextCursor` back as `cursor` until `hasMore` is false. The CLI
pages with `--take` and `--skip`.
