---
name: Enroll a contact in a sequence
summary: Enrolls one contact in a sequence, a series of timed email templates sent on behalf of a HubSpot user.
capability: send-email
docs: https://developers.hubspot.com/docs/api-reference/latest/automation/sequences/enrollment/enroll-a-contact
api: POST /automation/sequences/2026-09/enrollments
status: draft
updated: 2026-09-26
---

Draft: the sequences endpoints only accept apps configured with user-level access (OAuth), not the account-level service key this company's API way uses, and the enrolling user needs a Sales Hub or Service Hub Professional or Enterprise seat. The request names the `userId`, `contactId`, `sequenceId` and `senderEmail`.
