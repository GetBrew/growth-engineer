---
name: Tag a contact
summary: Adds or removes tags on one audience contact, creating any active tag that doesn't exist yet.
notes: Set `is_syncing` to `true` to keep automations based on these tags from firing.
capability: build-audience
docs: https://mailchimp.com/developer/marketing/api/list-member-tags/add-or-remove-member-tags/
api: POST /lists/{list_id}/members/{subscriber_hash}/tags
updated: 2026-09-27
---
