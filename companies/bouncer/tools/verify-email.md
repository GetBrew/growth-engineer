---
name: Verify an email address
summary: Checks one email address in real time and returns its status (deliverable, risky, undeliverable or unknown), the reason, a 0–100 score, toxicity and domain and account flags.
notes: "Costs 1 credit; unknown results are free. Answers within 10 seconds by default (`timeout` raises it, up to 30). A greylisted address returns `retryAfter`: verify it again after that time. Limited to 1,000 requests a minute."
capability: verify-emails
docs: https://docs.usebouncer.com/api-reference/real-time/verify-email
mcp: verify_email
api: GET /v1.1/email/verify
updated: 2026-10-06
---
