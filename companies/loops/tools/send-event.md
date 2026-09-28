---
name: Send an event
summary: Sends a named event for a contact, found by email address or user ID, to start the workflows it triggers, and creates the contact if it doesn't exist.
notes: "Create properties in Loops before you send them. Send an `Idempotency-Key` header: a key reused within 24 hours returns `409 Conflict`."
capability: track-events
docs: https://loops.so/docs/api-reference/send-event
mcp: execute
cli: loops events send
api: POST /v1/events/send
updated: 2026-09-27
---
