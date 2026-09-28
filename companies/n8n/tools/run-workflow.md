---
name: Run a workflow
summary: Starts one run of an n8n workflow, passing chat, form or webhook input to its trigger, and returns the execution ID without waiting for it to finish.
notes: Only workflows enabled for MCP access can run, and multi-step forms and human-in-the-loop steps aren't supported. `production` runs the published version, `manual` the draft; check the outcome with `get_workflow_execution`.
capability: automate-workflows
docs: https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference
mcp: execute_workflow
updated: 2026-09-27
---
