---
name: Run a workflow
summary: Starts one run of an n8n workflow, passing chat, form or webhook input to its trigger, and returns the execution ID without waiting for it to finish.
capability: automate-workflows
docs: https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference
mcp: execute_workflow
updated: 2026-09-27
---

Set `executionMode` to `production` to run the published version, which works
with Webhook, Chat Trigger, Form Trigger and Schedule Trigger nodes, or to
`manual` to test the current draft. If the workflow has more than one eligible
trigger, or its trigger needs input, name the trigger in `triggerNodeName`,
which is required whenever you pass `inputs`. Check the outcome with
`get_workflow_execution`. Only workflows enabled for MCP access can run, and
multi-step forms or human-in-the-loop steps aren't supported.
