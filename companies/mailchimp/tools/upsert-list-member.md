---
name: Create or update a contact
summary: Adds a contact to an audience or updates the contact with that email address, with its subscription status and merge fields.
notes: "`{subscriber_hash}` is the MD5 hash of the lowercase email address, or the address itself. `email_address` and `status_if_new` take effect only when the contact is new."
capability: build-audience
docs: https://mailchimp.com/developer/marketing/api/list-members/add-or-update-list-member/
api: PUT /lists/{list_id}/members/{subscriber_hash}
updated: 2026-09-27
---
