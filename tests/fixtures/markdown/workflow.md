---
ref: workflow:intent-to-meeting@3
title: Turn high-intent accounts into booked meetings
author: jdoe
tools: [tool:apollo/find-work-emails, tool:brew/send-email]
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

### Find work emails (tool:apollo/find-work-emails)

Use the API.

- Base URL: https://api.apollo.example/v1
- Endpoint: `POST /find-work-emails`
- Auth: send the header `X-Api-Key: $APOLLO_API_KEY`
- Get a key: https://app.apollo.example/settings/api

### Send email (tool:brew/send-email)

Use the MCP server. Add it to your agent's MCP settings.

```json
{ "mcpServers": { "brew": { "url": "https://mcp.brew.example/mcp" } } }
```

Call the MCP tool `brew_send_email`.

Make one read-only call to each tool to confirm access.

## Steps

1. **Find contacts** with Find work emails. For each domain in `target_accounts`, find the head of sales. Keep their name, title, and work email.
2. **Write emails** with Send email. Draft a short, specific email to each contact from step 1. Show the drafts to the user.
3. **Send** with Send email. After the user approves, send each email from `sender_email`.

## Done when

- Every account has a contact, or a note explaining why not.
- Approved emails are sent, and the user has a summary table.

## Rules

- Only use the tools listed above.
- Ask the user before anything that sends messages, costs money, or changes data.
- Never print API keys.
