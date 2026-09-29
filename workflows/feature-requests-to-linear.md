---
title: Attach feature requests from support chats to Linear issues
summary: Finds feature requests in recent Intercom conversations with Jev, matches each to an open Linear issue, and attaches the customer's ask.
author: thedogwiththedataonit
motion: retention
updated: 2026-09-29
---

## Outcome

- A table of every feature request found, with its product area, the issue it matches and Jev's confidence.
- Each matched request attached to its Linear issue as a customer request, linked to the conversation.
- A new Linear issue for each request you approved that matched no open issue.

## Inputs

- `since`: when the last run ended, so only newer conversations are read, e.g. 2026-09-22
- `product_areas`: the parts of your product a request can be about, e.g. reporting, integrations, billing, permissions, mobile
- `request_label`: the Linear label on feature-request issues, e.g. Feature request
- `team`: the Linear team that owns new requests, e.g. Product
- `min_confidence`: the confidence below which you decide a match yourself, e.g. 0.8

## Steps

1. **Pull recent conversations** with [intercom/search-conversations](../companies/intercom/tools/search-conversations.md). Search conversations updated after `since`. Keep each conversation's ID, the contact's email and company, and the text of the contact's messages.
2. **Find the requests** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each conversation's messages as the state, with a noul `feature_request` (asks for something the product does not do today) and a choice `area` over `product_areas` plus other. Keep the conversations whose `feature_request` is likely, with their area.
3. **List the open requests** with [linear/list-issues](../companies/linear/tools/list-issues.md). List the open issues labeled `request_label`. Keep each issue's ID, title and area.
4. **Match each request** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each request's messages as the state, with a choice `issue` whose labels are the open issues in its area, each described by its title, plus none. Keep the matched issue and its confidence.
5. **Settle the unsure ones**. Show the user every match below `min_confidence` and every request that matched none, and keep the issue the user picks or their approval to open a new one.
6. **Attach the asks** with [linear/add-customer-request](../companies/linear/tools/add-customer-request.md). Attach each matched request to its issue with the customer's own words and the Intercom conversation ID, under the customer's company.
7. **Open new issues** with [linear/create-issue](../companies/linear/tools/create-issue.md). Create an issue in `team`, labeled `request_label`, for each new request the user approved, titled by what the customer asked for.

## Notes

Matching a request to an issue is a choice over your own open issues, so it can only pick one that exists or none; a choice takes at most 255 labels, which is why step 4 narrows the issues to the request's area first. Customer requests carry the company, so each issue shows how many customers asked and who.

Run it weekly with `since` set to the previous run.
