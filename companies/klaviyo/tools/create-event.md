---
name: Create an event
summary: Records one event, such as a purchase, against a profile and creates or updates that profile.
capability: track-product-usage
docs: https://developers.klaviyo.com/en/reference/create_event
cli: klaviyo events create
api: POST /api/events
updated: 2026-09-27
---

Give the profile at least one identifier (`id`, `email` or `phone_number`)
and the metric a `name`. Events can trigger flows; set `backfill` to `true`
for historical events that shouldn't. The remote MCP server doesn't offer
single events, but `bulk_create_events` (`POST /api/event-bulk-create-jobs`)
records up to 1,000 events per request.
