---
name: Create an event
summary: Records one event, such as a purchase, against a profile and creates or updates that profile.
notes: "Events can trigger flows: set `backfill` to `true` for historical events that shouldn't. For many events, `POST /api/event-bulk-create-jobs` records up to 1,000 per request."
capability: track-events
docs: https://developers.klaviyo.com/en/reference/create_event
cli: klaviyo events create
api: POST /api/events
updated: 2026-09-27
---
