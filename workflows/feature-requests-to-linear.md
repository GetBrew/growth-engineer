---
title: Attach feature requests from support chats to Linear issues
summary: Finds feature requests in recent Intercom conversations with Jev, matches each to an open Linear issue, and attaches the customer's ask.
author: thedogwiththedataonit
motion: retention
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of every feature request found, with its product area, the issue it matches and Jev's confidence.
- Each request attached to its Linear issue as a customer request from the customer's company, with the Intercom conversation ID.
- A new Linear issue for each request you approved that matched no open issue.

## Inputs

- `since`: when the last run ended, so only conversations created after it are read, e.g. 2026-09-22
- `product_areas`: the parts of your product a request can be about, each also a label in Linear, with one line on what it covers, e.g. reporting: dashboards and exports; integrations: connections to other tools; billing: plans and invoices
- `request_label`: the Linear label on feature-request issues, e.g. Feature request
- `team`: the Linear team that owns new requests, e.g. Product
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it

## Steps

1. **Pull new conversations** with [intercom/search-conversations](../companies/intercom/tools/search-conversations.md). Search conversations created after `since`. Keep each conversation's ID, its opening message and its author's email, and read the rest of a conversation when its opening message is only a greeting, a read-only call.
2. **Find the requests** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each conversation's messages as the state, with a noul `feature_request` (asks for a new capability or a change, not help using an existing one) and a choice `area` over `product_areas`, each described by its line, plus other. Keep the conversations whose `feature_request` is yes, with their area, and the unsure ones for step 5.
3. **List the open requests** with [linear/list-issues](../companies/linear/tools/list-issues.md). List the open issues labeled `request_label`. Keep each issue's ID, title and labels; its area is the label that names one of `product_areas`.
4. **Match each request** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each request's messages as the state, with a choice `issue` whose labels are the open issues in the request's area (for other, the issues with no area label), each described by its title, plus none. When an area has more than 254 open issues, send its requests to the user in step 5 instead. Keep the matched issue and its confidence.
5. **Check the unsure ones with the user**. Show the user every unsure `feature_request`, every match below `min_confidence` and every request that matched none, and keep the issue the user picks or their approval to open a new one.
6. **Open new issues** with [linear/create-issue](../companies/linear/tools/create-issue.md). For each new request the user approved, create an issue in `team`, labeled `request_label` and its area, titled by what the customer asked for. Keep each new issue's ID.
7. **Attach the asks** with [linear/add-customer-request](../companies/linear/tools/add-customer-request.md). For each request, upsert the Linear customer by the author's email domain, listing personal email domains for the user instead, then attach the customer's own words and the Intercom conversation ID to its matched or new issue.

## Notes

Matching a request is a choice over your own open issues, so it can only pick one that exists or none; a choice takes at most 255 labels, which is why step 4 narrows the issues to the request's area first. Customer requests carry the company, so each issue shows which customers asked.

Run it weekly with `since` set to the previous run.
