---
name: List available times
summary: Returns the open start times of one event type within a range of up to 31 days, each with its booking page URL.
notes: Needs the `event_type` URI. The range can't start in the past or span more than 31 days, and the results aren't paginated.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/event-types/list-event-type-available-times
mcp: event_types-list_event_type_available_times
api: GET /event_type_available_times
updated: 2026-09-27
---
