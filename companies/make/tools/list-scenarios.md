---
name: List scenarios
summary: Returns the scenarios in a Make team or organization, filterable by name, folder and whether they are active.
notes: Needs a `teamId` or `organizationId` (`--team-id` on the CLI). Read a scenario's expected inputs with `GET /scenarios/{scenarioId}/interface` before running it.
capability: automate-workflows
docs: https://developers.make.com/api-documentation/api-reference/scenarios
cli: make-cli scenarios list
api: GET /scenarios
updated: 2026-09-27
---
