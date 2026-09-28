---
name: Track an event
summary: Records a named event with optional metadata against a user or lead, where teammates can filter on it and build segments from it.
notes: Leads need their Intercom `id`, and an unknown user returns 404. Only the first 10 metadata keys are kept, and repeats of the same contact, event name and `created_at` are ignored, so send the real event time.
capability: track-events
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/data-events/createdataevent
api: POST /events
updated: 2026-09-27
---
