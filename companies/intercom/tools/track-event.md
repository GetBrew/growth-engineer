---
name: Track an event
summary: Records a named event with optional metadata against a user or lead, where teammates can filter on it and build segments from it.
capability: track-product-usage
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/data-events/createdataevent
api: POST /events
updated: 2026-09-27
---

Send `event_name`, `created_at` (a Unix timestamp in seconds) and the
contact's `user_id`, `email` or Intercom `id`; leads need `id`. Only the first
10 metadata keys are kept. A success is `202 Accepted` with an empty body, and
an unknown user returns 404. Intercom ignores repeats of the same contact,
event name and `created_at`, so send the real event time.
