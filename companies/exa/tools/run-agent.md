---
name: Run a list-building and research agent
summary: Starts an Exa Agent run that searches and reads the web to build lists, enrich records you pass in or research a question, and returns cited findings with optional schema-validated JSON.
notes: "Runs asynchronously: poll `GET /agent/runs/{id}`, or on MCP pass the returned `id` back as `runId` while `status` is `running`. `effort` trades cost for completeness, and `budget` caps what an `auto` or `ultra` run can spend."
capability: find-prospects
docs: https://exa.ai/docs/reference/agent-api/create-a-run
mcp: agent_run
api: POST /agent/runs
updated: 2026-09-27
---
