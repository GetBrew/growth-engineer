---
name: Monitor an X account
summary: Creates a monitor that checks one X account every second and records the event types you choose, such as new posts, replies, quotes and profile changes.
notes: "Needs 30 available credits, then bills 30 credits an hour while active; pause it with PATCH /monitors/{id} and isActive false. Read events with GET /events or send them to a webhook from POST /webhooks. An API key needs the monitors scope."
capability: track-intent
docs: https://docs.xquik.com/api-reference/monitors/create
mcp: createMonitor
cli: x-twitter-scraper monitors create
api: POST /monitors
updated: 2026-10-31
---
