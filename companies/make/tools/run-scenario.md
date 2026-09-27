---
name: Run a scenario
summary: Runs an active Make scenario with the inputs you pass and returns the run's status, execution ID and, when the scenario defines them, its outputs.
capability: automate-workflows
docs: https://developers.make.com/api-documentation/api-reference/scenarios
mcp: scenarios_run
cli: make-cli scenarios run
api: POST /scenarios/{scenarioId}/run
updated: 2026-09-27
---

Pass the scenario's inputs in `data` (`--data` on the CLI). On the API,
`responsive: true` waits for the run to finish (`--responsive` on the CLI); a
run longer than 40 seconds times out the call but keeps going, and
`callbackUrl` receives the result when it ends. On the MCP server a run that
outlasts the tool timeout (25 seconds over OAuth) returns an `executionId`:
check it with `executions_get`. A scenario doesn't run while its organization
or team is paused for going over its operations or data transfer limit.
