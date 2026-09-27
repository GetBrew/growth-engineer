---
name: Add a contact to a segment
summary: Adds an existing contact, found by ID or email address, to a segment that broadcasts can target.
capability: build-audience
docs: https://resend.com/docs/api-reference/contacts/add-contact-to-segment
mcp: add-contact-to-segment
cli: resend contacts add-segment
api: POST /contacts/:contact_id/segments/:segment_id
updated: 2026-09-27
---

The contact must already exist; to put a new contact in segments as you
create it, pass `segments` to Create a contact. A broadcast goes to one
segment, so segment membership decides who receives it.
