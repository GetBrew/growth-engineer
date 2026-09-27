---
name: Create a workflow
summary: Creates an n8n workflow from its nodes and connections and returns the new workflow with its ID.
capability: automate-workflows
docs: https://docs.n8n.io/connect/n8n-api/workflow
mcp: create_workflow_from_code
cli: n8n-cli workflow create
api: POST /workflows
updated: 2026-09-27
---

The API and `n8n-cli workflow create --stdin` take workflow JSON. The MCP tool
takes TypeScript or JavaScript written with the n8n Workflow SDK, validated
first with `validate_workflow`; it assigns available credentials to nodes and
makes the workflow available to MCP. A workflow runs in production only once
it is published (`publish_workflow` on the MCP server).
