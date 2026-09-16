---
ref: workflow:brew/intent-to-meeting@3
title: Turn high-intent accounts into booked meetings
type: workflow
tools: [tool:apollo/apollo, tool:brew/brew]
tags: [motion:outbound, channel:email]
updated: 2026-09-16
---

# Turn high-intent accounts into booked meetings

Set up the tools below, then run the steps in order for the user.

## Inputs

Ask the user for these before you start.

- `target_accounts`: company domains to target, e.g. acme.example, globex.example
- `sender_email`: the address emails are sent from

## Set up

### Apollo (tool:apollo/apollo)

Use the API.

- Base URL: https://api.apollo.example/v1
- Auth: send the header `X-Api-Key: $APOLLO_API_KEY`
- Get a key: https://app.apollo.example/settings/api

### Brew (tool:brew/brew)

Use the MCP server. Add it to your agent's MCP settings.

```json
{ "mcpServers": { "brew": { "url": "https://mcp.brew.example/mcp" } } }
```

Make one read-only call to each tool to confirm access.

## Steps

1. **Find contacts** with Apollo. For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.
2. **Write emails** with Brew. Draft a short, specific email to each contact from step 1. Show the drafts to the user.
3. **Send** with Brew. After the user approves, send each email from `sender_email`.

## Done when

- Every account has a contact, or a note explaining why not.
- Approved emails are sent, and the user has a summary table.

## Rules

- Only use the tools listed above.
- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
