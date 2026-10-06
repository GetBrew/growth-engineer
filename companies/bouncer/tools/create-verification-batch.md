---
name: Create a verification batch
summary: Queues a list of up to 100,000 email addresses for verification and returns a batchId, the number of addresses and the duplicates found.
notes: "Send `[{\"email\": \"…\"}]`. Batches of 1,000 to 10,000 are recommended, and an account's batches run one after another. Returns `402` when credits run short. Poll the batch's status, then download its results."
capability: verify-emails
docs: https://docs.usebouncer.com/api-reference/batch/batch-create
mcp: create_batch
api: POST /v1.1/email/verify/batch
updated: 2026-10-06
---
