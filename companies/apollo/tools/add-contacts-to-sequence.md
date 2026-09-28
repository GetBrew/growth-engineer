---
name: Add contacts to a sequence
summary: Enrolls saved contacts in an Apollo sequence so its email steps go out from the mailbox you choose.
notes: "Only saved contacts can be enrolled, so create the person as a contact first, and pass a sending mailbox id from the email accounts list. Enrolling can start real outbound email: confirm the sequence, mailbox and contacts first."
capability: enroll-in-sequence
docs: https://docs.apollo.io/reference/add-contacts-to-sequence
mcp: apollo_emailer_campaigns_add_contact_ids
cli: apollo sequences add-contacts
api: POST /emailer_campaigns/{sequence_id}/add_contact_ids
aliases:
  - apollo/send-email
updated: 2026-09-26
---
