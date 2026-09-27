---
name: List scenarios
summary: Returns the scenarios in a Make team or organization, filterable by name, folder and whether they are active.
capability: automate-workflows
docs: https://developers.make.com/api-documentation/api-reference/scenarios
cli: make-cli scenarios list
api: GET /scenarios
updated: 2026-09-27
---

Pass `teamId` or `organizationId` on the API, and `--team-id` on the CLI. Read
the inputs a scenario expects with `make-cli scenarios interface` or
`GET /scenarios/{scenarioId}/interface` before running it.
