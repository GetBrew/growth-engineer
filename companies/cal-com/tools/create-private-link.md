---
name: Create a private booking link
summary: Returns a private booking URL for an event type that expires after a number of bookings or at a set time.
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/event-types-private-links/create-a-private-link-for-an-event-type
cli: calcom private-links create
api: POST /v2/event-types/{eventTypeId}/private-links
updated: 2026-09-27
---

Without `expiresAt` or `maxUsageCount` the link is single-use, so create one
per prospect and send the returned `bookingUrl`. Set `maxUsageCount` to allow
more bookings, or `expiresAt` to make the link time-based. Send
`cal-api-version: 2024-09-04`. The MCP server has no dedicated tool for this
call.
