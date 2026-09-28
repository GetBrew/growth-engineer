---
ref: workflow:intent-to-meeting
title: Turn high-intent accounts into booked meetings
author: jdoe
tools: [tool:apollo/bulk-enrich-people, tool:brew/send-email]
tags: [motion:outbound, channel:email]
updated: 2026-09-16
---

# Turn high-intent accounts into booked meetings

Set up the tools below, then run the steps in order for the user, carrying each step's results into the next.

## Inputs

Ask the user for these before you start.

- `target_accounts`: company domains to target, e.g. acme.example, globex.example
- `sender_email`: the address emails are sent from

## Set up

### Enrich up to 10 people (Apollo, tool:apollo/bulk-enrich-people)

Use the API.

- Base URL: https://api.apollo.example/v1
- Endpoint: `POST /people/bulk_match`
- Auth: send the header `X-Api-Key: $APOLLO_API_KEY`
- Get a key: https://app.apollo.example/settings/api

Note: Credits are charged per person, and only when data is found.

### Send email (Brew, tool:brew/send-email)

Use the MCP server. Add it to your agent's MCP settings.

```json
{ "mcpServers": { "brew": { "url": "https://mcp.brew.example/mcp" } } }
```

Call the MCP tool `brew_send_email`.

Note: An admin turns on MCP access under Settings first.

Before step 1, confirm access to each service with one read-only call, like a list or a search. Never send, create or spend anything to test access.

## Steps

1. **Find contacts** with Enrich up to 10 people (Apollo). For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.
2. **Send** with Send email (Brew). Draft a short, specific email to each contact from step 1 and show the drafts to the user. After the user approves, send each one from `sender_email`.

## Done when

- Every account has a contact, or a note explaining why not.
- Approved emails are sent, and the user has a summary table.

## Rules

- Use only the services set up above. The read-only calls they need, like listing ids or polling for results, are fine.
- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
