---
name: Download a verification batch's results
summary: Returns every address in a completed batch with its status, reason, score, toxicity and domain and account flags, optionally filtered to one status.
notes: "Wait until the batch's status is `completed`. `download` is all, deliverable, risky, undeliverable or unknown. Returns JSON, or CSV with `Accept: text/csv`."
capability: verify-emails
docs: https://docs.usebouncer.com/api-reference/batch/batch-results
mcp: get_batch_results
api: GET /v1.1/email/verify/batch/{batchId}/download
updated: 2026-10-06
---
