---
name: Tag a contact
summary: Adds or removes tags on one audience contact, creating any active tag that doesn't exist yet.
capability: build-audience
docs: https://mailchimp.com/developer/marketing/api/list-member-tags/add-or-remove-member-tags/
api: POST /lists/{list_id}/members/{subscriber_hash}/tags
updated: 2026-09-27
---

Pass each tag as `{ "name": ..., "status": "active" }` to add it or
`"inactive"` to remove it. Set `is_syncing` to `true` to keep automations
based on these tags from firing.
