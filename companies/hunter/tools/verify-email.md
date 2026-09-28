---
name: Verify an email address
summary: Checks whether an email address is deliverable and returns its status (valid, invalid, accept_all, webmail, disposable or unknown), a score and the checks behind it.
notes: "Past 20 seconds it returns `202`: call again with the same email until the result arrives. Read `status`, not the deprecated `result`. Costs half a credit and saves the email to your Hunter leads unless that is turned off."
capability: verify-emails
docs: https://hunter.io/api-documentation/v2#email-verifier
mcp: Email-Verifier
api: GET /email-verifier
updated: 2026-09-27
---
