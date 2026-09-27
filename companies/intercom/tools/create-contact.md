---
name: Create a contact
summary: Creates a user or lead from an email, an external ID or a role, with optional name, phone, owner and custom attributes, and returns the contact.
capability: manage-crm
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/contacts/createcontact
api: POST /contacts
updated: 2026-09-27
---

Set `role` to `user` or `lead` and pass at least an `email`, an `external_id`
or a `role`. To change a contact that already exists, use
`PUT /contacts/{contact_id}` instead.
