---
name: Create a contact
summary: Adds a person, with name, title, emails, phones and URLs, to a lead and returns the new contact.
capability: manage-crm
docs: https://developer.close.com/api/resources/contacts/create
mcp: create_contact
api: POST /contact/
updated: 2026-09-27
---

A contact belongs to exactly one lead: pass its `lead_id`. Without one, Close
creates a new lead named after the contact. Send `emails` as objects with an
`email` and an optional `type`.
