---
name: Add contacts to a sequence
summary: Enrolls saved contacts in an Apollo sequence so its email steps go out from the mailbox you choose.
capability: send-email
docs: https://docs.apollo.io/reference/add-contacts-to-sequence
mcp: apollo_emailer_campaigns_add_contact_ids
cli: apollo sequences add-contacts
api: POST /emailer_campaigns/{sequence_id}/add_contact_ids
aliases:
  - apollo/send-email
updated: 2026-09-26
---

Only contacts can be enrolled, so create the person as a contact first. Pass
the sequence id as both `sequence_id` and `emailer_campaign_id`, the
`contact_ids[]`, and `send_email_from_email_account_id` (list mailboxes with
`apollo_email_accounts_index` or `apollo email-accounts list`). Enrolling can
start real outbound email: confirm the sequence, mailbox and contacts first.
