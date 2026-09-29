---
title: Hand buyers who ask in your website chat to sales
summary: Reads recent Intercom conversations, spots buying questions with Jev, and logs each buyer in HubSpot with a note and a Slack alert.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new conversation with whether it asked a buying question, who asked, how ready they are and Jev's confidence.
- Each buyer with an email created or updated in HubSpot, with a note quoting what they asked, and the buyers with no email listed.
- A Slack post for each buyer, the most ready first.

## Inputs

- `since`: when the last run ended, so only newer conversations are read, e.g. 2026-09-29 08:00 UTC
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `max_enrichments`: the most people to enrich in one run, since each match costs an Apollo credit, e.g. 30
- `sales_channel`: the Slack channel for buyers, e.g. #inbound-leads

## Steps

1. **Pull new conversations** with [intercom/search-conversations](../companies/intercom/tools/search-conversations.md). Search conversations created after `since`. Keep each conversation's ID, its opening message and its author's name, email and type (user or lead), and read the rest of a conversation when its opening message is only a greeting, a read-only call.
2. **Spot the buyers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each conversation's messages as the state, with a noul `buying_question` (asks about prices, plans, a demo, a trial, a security review or buying for a team), a choice `asker` of new_prospect (not yet a customer), customer_expansion (a customer who wants more seats, SSO, higher limits or a bigger plan), customer_support (a customer who needs help), job_seeker and other, and a score `readiness` on three levels (curious; comparing options; ready to buy). Keep every answer with its confidence or probability.
3. **Keep the buyers**. Keep the conversations whose `buying_question` is yes and whose asker is a new_prospect or customer_expansion. Show the user the ones whose `buying_question` is unsure or whose asker confidence is below `min_confidence`, and keep the ones the user confirms. List the buyers with no email apart: they are not enriched or logged.
4. **Look them up** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Enrich up to `max_enrichments` buyers by work email. Keep each one's title and company, with the company's size and industry.
5. **Log the buyers** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). After the user approves, upsert each buyer by email with their name, title and company. Keep each contact's ID.
6. **Note what they asked** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID quoting their question, with the asker type, the readiness level and the Intercom conversation ID.
7. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each buyer to `sales_channel` with their name, title, company, readiness and question, the most ready first, and the buyers with no email in one message.

## Notes

Support keeps answering the conversation as usual; this play makes sure a buyer inside a support queue reaches a seller the same day. Chat text is written by visitors, so the labels only decide who sees a conversation: nothing here writes to the visitor or changes a customer's plan.

Run it every hour with `since` set to the previous run.
