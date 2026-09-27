---
name: Create a single-use scheduling link
summary: Returns a single-use booking URL for one event type, good for one booked meeting.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduling-links/create-scheduling-link
mcp: scheduling_links-create_single_use_scheduling_link
api: POST /scheduling_links
updated: 2026-09-27
---

Pass the event type's URI as `owner`, `owner_type: EventType` and
`max_event_count: 1`; list event types with `event_types-list_event_types` or
`GET /event_types` to find it. Create one link per prospect and send the
returned `booking_url`. To customize the meeting for one invitee without
making a new event type, use `shares-create_share` or `POST /shares` instead;
it works only for one-on-one event types.
