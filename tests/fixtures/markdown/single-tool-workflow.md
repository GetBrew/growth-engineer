---
ref: workflow:work-emails-for-a-list
title: Find work emails for a list of contacts
author: jdoe
tools: [tool:clay/run-routine]
tags: [motion:outbound]
updated: 2026-09-16
---

# Find work emails for a list of contacts

Set up Run a routine (Clay), then run the steps in order for the user, carrying each step's results into the next.

## Inputs

Ask the user for this before you start.

- `contacts`: the people to enrich, each with a name and company domain

## Set up

### Run a routine (Clay, tool:clay/run-routine)

Use the MCP server. Add it to your agent's MCP settings, then sign in when asked.

```json
{ "mcpServers": { "clay": { "url": "https://mcp.clay.example/mcp" } } }
```

Call the MCP tool `clay_run_routine`.

Note: List routines first to get the routine id, then poll the run id for results.

Before step 1, confirm access with one read-only call, like a list or a search. Never send, create or spend anything to test access.

## Steps

1. **Start runs** of the Work Email routine on `contacts`, up to 100 per run. Keep each run id.
2. **Collect results** for every run id once it finishes. Keep each contact's work email, or a note that none was found.

## Done when

- Every contact has a work email, or a note explaining why not.
- The user has a table of the results.

## Rules

- Use only the services set up above. The read-only calls they need, like listing ids or polling for results, are fine.
- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
