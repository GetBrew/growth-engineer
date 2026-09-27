---
name: Run a search action in an app
summary: Runs one read or search action in an app connected to Zapier, such as finding an email or looking up a contact, and returns what it finds.
capability: automate-workflows
docs: https://docs.zapier.com/mcp/overview/how-tools-work
mcp: execute_zapier_read_action
cli: zapier-sdk run-action
updated: 2026-09-27
---

On the CLI, pass the app, the action's type (`search` for lookups) and its
key, with `--connection` and `--inputs` as JSON; find an app's search actions
with `zapier-sdk list-actions <app> --action-type search`. Each successful MCP
tool call uses two tasks from the Zapier plan.
