---
name: Find actions in an app
summary: Returns the actions Zapier can run in an app, such as sending a message or finding a record, so the right one can be enabled and run.
capability: automate-workflows
docs: https://docs.zapier.com/mcp/overview/how-tools-work
mcp: discover_zapier_actions
cli: zapier-sdk list-actions
updated: 2026-09-27
---

On the MCP server, `discover_zapier_actions` searches apps and actions for the
task at hand; add the one you need as a tool with `enable_zapier_action`. On
the CLI, `zapier-sdk list-actions <app>` lists an app's actions with each one's
key and type (narrow it with `--action-type write` or `--action-type search`),
and `zapier-sdk list-action-input-fields <app> <action-type> <action>` shows the
inputs an action needs. Discover app and action keys at runtime rather than
hardcoding them.
