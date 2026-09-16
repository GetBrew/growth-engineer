---
ref: workflow:jdoe/clay-waterfall-order@1
title: Find more work emails by ordering providers by hit rate
type: hack
tools: [tool:clay/clay]
tags: [capability:find-work-emails]
updated: 2026-09-16
---

# Find more work emails by ordering providers by hit rate

Set up Clay, then run the steps in order for the user.

## Inputs

Ask the user for this before you start.

- `contacts_table`: the Clay table with name and company domain columns

## Set up

### Clay (tool:clay/clay)

Use the MCP server. Add it to your agent's MCP settings, then sign in when asked.

```json
{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }
```

Make one read-only call to confirm access.

## Steps

1. **Sample** 50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate.
2. **Reorder** the providers from highest to lowest hit rate, stopping at the first verified email.
3. **Run** the reordered sequence on the full table, after the user confirms.

## Done when

- The table has a verified email column.
- The user has the hit rate for each provider.

## Rules

- Only use the tools listed above.
- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
