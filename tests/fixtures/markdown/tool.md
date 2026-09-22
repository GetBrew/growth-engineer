---
ref: tool:clay/enrich-contacts
name: Enrich contacts
company: company:clay
workflows: []
access: [mcp, api]
agent: native
agent_note: Official remote MCP with self-serve OAuth.
updated: 2026-09-16
---

# Enrich contacts

Adds firmographic and person data to a contact or account. Clay does this.

## Set up

Use the first option your agent supports.

### MCP (official, remote)

Add this server to your agent's MCP settings, then sign in when asked.

```json
{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }
```

Call the MCP tool `clay_enrich_contacts`.

Server URL: https://mcp.clay.example/mcp

### API (official)

- Base URL: https://api.clay.example/v1
- Endpoint: `POST /enrich-contacts`
- Auth: send the header `Authorization: Bearer $CLAY_API_KEY`
- Get a key: https://app.clay.example/settings/api
- Docs: https://docs.clay.example

Before doing anything else, make one read-only call to confirm access.

## Rules

- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
