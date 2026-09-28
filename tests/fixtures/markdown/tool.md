---
ref: tool:clay/run-routine
name: Run a routine
company: company:clay
workflows: []
access: [mcp, api]
tags: [capability:enrich-contacts, category:data-provider, has:api, has:mcp]
updated: 2026-09-16
---

# Run a routine

Runs an enrichment function, such as Work Email, on up to 100 records and returns a run id.

Note: List routines first to get the routine id, then poll the run id for results.

## Set up

Use the first option your agent supports.

### MCP (official, remote)

Add this server to your agent's MCP settings, then sign in when asked.

```json
{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }
```

Call the MCP tool `clay_run_routine`.

Server URL: https://mcp.clay.example/mcp

### API (official)

- Base URL: https://api.clay.example/v1
- Endpoint: `POST /routines/{routine_id}/run`
- Auth: send the header `Authorization: Bearer $CLAY_API_KEY`
- Get a key: https://app.clay.example/settings/api
- Docs: https://docs.clay.example

Before anything else, confirm access with one read-only call, like a list or a search. Never send, create or spend anything to test access.

## Rules

- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
