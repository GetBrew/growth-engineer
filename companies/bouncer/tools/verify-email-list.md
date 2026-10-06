---
name: Verify a list of email addresses
summary: Verifies up to 10,000 email addresses in one request and returns a result for each, with status, reason, score, toxicity and domain and account flags.
notes: "Takes a JSON array of addresses, up to 10,000 per request and 100 requests a minute. Results are cached for 24 hours, so the same address is not charged twice. Costs 1 credit per address; duplicates and unknown results are free."
capability: verify-emails
docs: https://docs.usebouncer.com/api-reference/batch-sync/batch-sync
mcp: verify_emails_sync
api: POST /v1.1/email/verify/batch/sync
updated: 2026-10-06
---
