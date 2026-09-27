---
name: Run a write action in an app
summary: Runs one write action in an app connected to Zapier, such as sending a message, creating a task or updating a record, and returns the result.
capability: automate-workflows
docs: https://docs.zapier.com/mcp/overview/how-tools-work
mcp: execute_zapier_write_action
cli: zapier-sdk run-action
updated: 2026-09-27
---

On the MCP server the action runs through the app's default connection; to use
another, look up its ID with `list_zapier_connections` and pass it as
`connection_id`. On the CLI, pass the app, `write` and the action key, with
`--connection` (an ID from `zapier-sdk list-connections`) and `--inputs` as
JSON, as in `zapier-sdk run-action google-sheets write add_row`. Each
successful MCP tool call uses two tasks from the Zapier plan. A write reaches
real people and records: confirm the inputs first.
