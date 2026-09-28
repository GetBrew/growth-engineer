---
name: Create a private booking link
summary: Returns a private booking URL for an event type that expires after a number of bookings or at a set time.
notes: "Without `expiresAt` or `maxUsageCount` the link is single-use, so create one per prospect. Send `cal-api-version: 2024-09-04`; the MCP server has no tool for this call."
capability: book-meetings
docs: https://cal.com/docs/api-reference/v2/event-types-private-links/create-a-private-link-for-an-event-type
cli: calcom private-links create
api: POST /v2/event-types/{eventTypeId}/private-links
updated: 2026-09-27
---
