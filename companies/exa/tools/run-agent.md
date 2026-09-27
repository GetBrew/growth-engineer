---
name: Run a list-building and research agent
summary: Starts an Exa Agent run that searches and reads the web to build lists, enrich records you pass in or research a question, and returns cited findings with optional schema-validated JSON.
capability: build-audience
docs: https://exa.ai/docs/reference/agent-api/create-a-run
mcp: agent_run
api: POST /agent/runs
updated: 2026-09-27
---

Describe the data you want in `query`. Pass `outputSchema` for JSON in
`output.structured`, `input.data` for rows to enrich, and `effort` to trade
cost for completeness; `budget` caps what an `auto` or `ultra` run can spend.
Runs are asynchronous: the API returns the run to poll with
`GET /agent/runs/{id}`, and the MCP tool reports `status: "running"` with an
`id` to pass back as `runId`. `agent_run` needs OAuth or an API key.
