---
name: Find workflows
summary: Returns the n8n workflows you have access to, filtered by name, tags or project, with each one's ID and whether it is active.
notes: Over MCP, returns up to 200 previews, and an agent can run only the workflows whose `availableInMCP` is true.
capability: automate-workflows
docs: https://docs.n8n.io/connect/n8n-api/workflow
mcp: search_workflows
cli: n8n-cli workflow list
api: GET /workflows
updated: 2026-09-27
---
