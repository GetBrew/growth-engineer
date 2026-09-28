---
name: Run a research agent
summary: Starts an agent that searches, navigates and reads the web to return the data a prompt describes, as JSON.
notes: "Runs as a job: the API returns an `id` to poll with `GET /agent/{jobId}`, and on MCP check it with `firecrawl_agent_status`. Firecrawl labels Agent a research preview."
capability: search-web
docs: https://docs.firecrawl.dev/api-reference/endpoint/agent
mcp: firecrawl_agent
cli: firecrawl agent
api: POST /agent
aliases:
  - firecrawl/research-accounts
updated: 2026-09-26
---
