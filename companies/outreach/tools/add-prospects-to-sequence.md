---
name: Add prospects to a sequence
summary: Enrolls one or more prospects in an Outreach sequence, sending from the mailbox you choose, and returns the status of the batch.
notes: Enrolling starts the sequence's automation, so confirm the sequence, mailbox and prospects first. Find the sequence with `sequence_search` or `GET /sequences`, and check the result with `sequence_state_search`.
capability: enroll-in-sequence
docs: https://developers.outreach.io/api/reference/batch/paths/~1batches~1actions~1prospectsaddtosequence/post
mcp: sequence_add_prospects
api: POST /batches/actions/prospectsAddToSequence
updated: 2026-09-27
---
