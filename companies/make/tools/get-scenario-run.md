---
name: Get a scenario run
summary: Returns one scenario run's status, such as running, success, warning or error, and its outputs or error once it ends.
notes: "Poll until the status is no longer `RUNNING`: a run whose call timed out keeps going in Make for up to 40 minutes."
capability: automate-workflows
docs: https://developers.make.com/api-documentation/api-reference/scenarios/logs
mcp: executions_get
cli: make-cli executions get
api: GET /scenarios/{scenarioId}/executions/{executionId}
updated: 2026-09-27
---
