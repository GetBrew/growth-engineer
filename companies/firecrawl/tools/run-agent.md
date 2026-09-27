---
name: Run a research agent
summary: Starts an agent that searches, navigates and reads the web to return the data a prompt describes, as JSON.
capability: research-accounts
docs: https://docs.firecrawl.dev/api-reference/endpoint/agent
mcp: firecrawl_agent
cli: firecrawl agent
api: POST /agent
aliases:
  - firecrawl/research-accounts
updated: 2026-09-26
---

Use it when the source pages are not known, such as a company plus the fields you need about it; pass a JSON schema for structured output and optional seed URLs. The agent runs as a job: the API returns an `id` to poll with `GET /agent/{jobId}`, and the MCP server pairs `firecrawl_agent` with `firecrawl_agent_status`. Firecrawl labels Agent a research preview.
