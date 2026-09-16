---
ref: tool:clay/clay
name: Clay
company: company:clay
does: [enrich-contacts, find-work-emails, build-audience]
access: [mcp, api]
agent: native
agent_note: Official remote MCP with self-serve OAuth.
updated: 2026-09-16
---

# Clay

Enriches people and companies with data from many providers and builds lead lists from the results.

## Set up

Use the first option your agent supports.

### MCP (official, remote)

Add this server to your agent's MCP settings, then sign in when asked.

```json
{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }
```

Server URL: https://mcp.clay.example/mcp

### API (official)

- Base URL: https://api.clay.example/v1
- Auth: send the header `Authorization: Bearer $CLAY_API_KEY`
- Get a key: https://app.clay.example/settings/api
- Docs: https://docs.clay.example

Before doing anything else, make one read-only call to confirm access.

## What it can do

- Enrich contacts
- Find work emails
- Build audiences

## Rules

- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
