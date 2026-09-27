---
name: Verify an email address
summary: Checks whether one email address is deliverable and returns verified, invalid or pending, whether its domain is catch-all, and the credits used.
capability: verify-emails
docs: https://developer.instantly.ai/api-reference/emailverification/create-email-verification
api: POST /api/v2/email-verification
updated: 2026-09-27
---

Send the `email`. A check that takes longer than 10 seconds returns
`pending`: poll `GET /api/v2/email-verification/{email}` or pass a
`webhook_url` to receive the result. Read `verification_status`, not
`status`, which only reports whether the request worked. The workspace needs
an active paid plan, and the key needs the `email_verifications:create` scope.
