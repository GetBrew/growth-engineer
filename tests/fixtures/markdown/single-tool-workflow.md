---
ref: workflow:work-emails-for-a-list
title: Find work emails for a list of contacts
author: jdoe
tools: [tool:clay/run-routine]
tags: [motion:outbound]
updated: 2026-09-16
---

# Find work emails for a list of contacts

Runs Clay's Work Email routine on your contacts and collects a work email for each.

Set up Run a routine (Clay), then run the steps in order for the user, carrying each step's results into the next. The run is done when the user has the outcome below.

## Outcome

- A work email for every contact, or a note on why none was found.
- A table of the results.

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

Before step 1, confirm access with the cheapest read-only call, like a list or a search. Never send or change anything to test access.

## Steps

1. **Start runs**. Run the Work Email routine on `contacts`, up to 100 per run. Keep each run id.
2. **Collect results**. Read the results of every run id once it finishes. Keep each contact's work email, or a note that none was found.

## Rules

- Use only the services set up above. The read-only calls they need, like listing ids or polling for results, are fine.
- Ask the user before anything that sends messages, costs money, or changes data, and say how many records it touches. One approval covers a batch the user has seen.
- Never print API keys.
