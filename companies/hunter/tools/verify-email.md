---
name: Verify an email address
summary: Checks whether an email address is deliverable and returns its status (valid, invalid, accept_all, webmail, disposable or unknown), a score and the checks behind it.
capability: verify-emails
docs: https://hunter.io/api-documentation/v2#email-verifier
mcp: Email-Verifier
api: GET /email-verifier
updated: 2026-09-27
---

Pass the `email`. A verification that runs past 20 seconds returns `202`:
call again with the same email until the result arrives, which still counts
as one request. Read `status`; the older `result` field is deprecated. A
verification costs half a credit, and a verified email is also saved to your
Hunter leads unless that is turned off for the account.
