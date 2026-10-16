---
name: Find a work email
summary: Returns a work email for one person from a name and a company domain, using the first provider looot can run.
notes: "Set `endpointId` to `job:people.email.find` and `input` to first_name, last_name and domain, plus an `idempotencyKey`. About $0.0036 per call at the cheapest provider; a miss is a normal answer."
capability: find-work-emails
docs: https://docs.looot.ai/mcp-tools/run
mcp: run
api: POST /v1/runs
updated: 2026-10-16
---
