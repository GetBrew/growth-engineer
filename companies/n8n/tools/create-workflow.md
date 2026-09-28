---
name: Create a workflow
summary: Creates an n8n workflow from its nodes and connections and returns the new workflow with its ID.
notes: Over MCP, write it with the n8n Workflow SDK and check it with `validate_workflow` first. The new workflow runs in production only once it is published (`publish_workflow` on the MCP server).
capability: automate-workflows
docs: https://docs.n8n.io/connect/n8n-api/workflow
mcp: create_workflow_from_code
cli: n8n-cli workflow create
api: POST /workflows
updated: 2026-09-27
---
