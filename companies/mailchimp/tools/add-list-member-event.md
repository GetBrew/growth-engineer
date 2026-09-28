---
name: Add an event for a contact
summary: Records a named event, with optional properties and time, for one audience contact.
notes: "Events can trigger automations: set `is_syncing` to `true` when importing ones that shouldn't. The event `name` is 2 to 30 characters."
capability: track-events
docs: https://mailchimp.com/developer/marketing/api/list-member-events/add-event/
api: POST /lists/{list_id}/members/{subscriber_hash}/events
updated: 2026-09-27
---
