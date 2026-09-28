---
name: Fire a trigger event
summary: Validates an event payload, upserts the contact it describes and starts one run of every published automation listening to that trigger.
notes: Always pass an idempotency key, such as the event name, user id and event timestamp.
capability: track-events
docs: https://docs.brew.new/api-reference/public-v1/automations/fire-a-trigger
mcp: fire_trigger_event
cli: brew-cli automations triggers fire
api: POST /v1/automations/triggers/{triggerEventId}/fire
updated: 2026-09-26
---
