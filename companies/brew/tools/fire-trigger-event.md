---
name: Fire a trigger event
summary: Validates an event payload, upserts the contact it describes and starts one run of every published automation listening to that trigger.
notes: "Require a published listening automation. Reuse the event's idempotency key on retries. On a confirmation request, obtain approval and repeat with confirmed:true and the returned confirmation_id. Unsubscribe and domain-purpose rules apply."
capability: track-events
docs: https://docs.brew.new/api-reference/public-v1/automations/fire-a-trigger
mcp: fire_trigger_event
cli: brew-cli automations triggers fire
api: POST /v1/automations/triggers/{triggerEventId}/fire
updated: 2026-10-11
---
