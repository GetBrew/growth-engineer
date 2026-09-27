---
name: Invite a waitlist entry
summary: Sends an invitation to the email address on a waitlist entry so that person can sign up.
capability: authenticate-users
docs: https://clerk.com/docs/reference/backend-api/tag/waitlist-entries/POST/waitlist_entries/%7Bwaitlist_entry_id%7D/invite
api: POST /waitlist_entries/{waitlist_entry_id}/invite
updated: 2026-09-26
---

Needs the application in Waitlist sign-up mode. Find entry ids with
`GET /waitlist_entries`.
