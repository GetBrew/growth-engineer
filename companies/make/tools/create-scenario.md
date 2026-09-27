---
name: Create a scenario
summary: Creates a Make scenario in a team from a blueprint of modules and a schedule, and returns the new scenario's details.
capability: automate-workflows
docs: https://developers.make.com/api-documentation/api-reference/scenarios
mcp: scenarios_create
cli: make-cli scenarios create
api: POST /scenarios
updated: 2026-09-27
---

`teamId`, `scheduling` and `blueprint` are required; the blueprint lists the
modules, their parameters and the connections they use. A new scenario is
inactive: activate it with `scenarios_activate`, `make-cli scenarios activate`
or `POST /scenarios/{scenarioId}/start` before running it.
