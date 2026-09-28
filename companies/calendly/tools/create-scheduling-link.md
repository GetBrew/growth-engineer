---
name: Create a single-use scheduling link
summary: Returns a single-use booking URL for one event type, good for one booked meeting.
notes: "Needs the event type's URI as `owner`, with `owner_type: EventType` and `max_event_count: 1`: list event types first to find it. Create one link per prospect."
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduling-links/create-scheduling-link
mcp: scheduling_links-create_single_use_scheduling_link
api: POST /scheduling_links
updated: 2026-09-27
---
