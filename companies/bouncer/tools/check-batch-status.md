---
name: Check a verification batch's status
summary: Returns a batch's status (queued, processing or completed) and, with with-stats=true, how many addresses it has processed and its count of each verification status.
notes: "Poll about every 10 seconds until `status` is `completed`. `credits` is filled in only once the batch completes."
capability: verify-emails
docs: https://docs.usebouncer.com/api-reference/batch/batch-status
mcp: check_batch_status
api: GET /v1.1/email/verify/batch/{batchId}
updated: 2026-10-09
---
