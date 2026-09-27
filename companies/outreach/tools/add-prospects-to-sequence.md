---
name: Add prospects to a sequence
summary: Enrolls one or more prospects in an Outreach sequence, sending from the mailbox you choose, and returns the status of the batch.
capability: send-email
docs: https://developers.outreach.io/api/reference/batch/paths/~1batches~1actions~1prospectsaddtosequence/post
mcp: sequence_add_prospects
api: POST /batches/actions/prospectsAddToSequence
updated: 2026-09-27
---

Find the sequence with `sequence_search` on the MCP server or `GET /sequences`
over the API. The API call takes the prospect `ids`, the `sequenceId` and the
sender's `mailboxId` under `data.attributes`; to enroll a single prospect,
`POST /sequenceStates` with prospect, sequence and mailbox relationships does
the same. Enrolling starts the sequence's automation, so confirm the sequence,
mailbox and prospects first, and check the result with `sequence_state_search`.
