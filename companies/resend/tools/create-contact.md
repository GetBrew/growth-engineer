---
name: Create a contact
summary: Adds a contact with an email address and optional name, custom properties, segments and topic subscriptions, and returns its ID.
capability: build-audience
docs: https://resend.com/docs/api-reference/contacts/create-contact
mcp: create-contact
cli: resend contacts create
api: POST /contacts
updated: 2026-09-27
---

Pass `segments` to add the new contact to segments in the same call, and
`topics` to set its topic subscriptions. Setting `unsubscribed` to `true`
keeps the contact out of every broadcast.
