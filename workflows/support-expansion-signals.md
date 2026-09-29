---
title: Send expansion asks in support tickets to account owners
summary: Finds new Zendesk tickets that ask for seats, SSO, higher limits or another team with Jev, and notes each in HubSpot for its owner.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new ticket that asks for more, with what kind of expansion it is, its company and Jev's confidence.
- A note on each company's HubSpot record quoting the ask, for its owner.
- A Slack post for each expansion ask, with its company and owner.

## Inputs

- `since`: when the last run ended, so only newer tickets are read, e.g. 2026-09-28
- `min_confidence`: the confidence below which you judge a ticket yourself, e.g. 0.75
- `am_channel`: the Slack channel account managers watch, e.g. #expansion

## Steps

1. **Pull new tickets** with [zendesk/search](../companies/zendesk/tools/search.md). Search `type:ticket created>` `since`. Keep each ticket's ID, subject, description and requester's email.
2. **Spot the asks** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each subject and description as the state, with a noul `expansion` (asks for something that means buying more), a choice `kind` of more_seats, sso_or_security_review, higher_limits, new_team_or_use_case, api_access, plan_upgrade and none, and a score `readiness` on three levels (asking what is possible; comparing plans; ready to buy). Keep the tickets whose `expansion` is likely, with their kind, readiness and confidence.
3. **Settle the unsure ones**. Show the user every kept ticket whose kind confidence is below `min_confidence`, and keep the kind the user picks.
4. **Find the account** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each requester's email domain. Keep the company's record ID, name and `hubspot_owner_id`; note the tickets with no match.
5. **Note the ask** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). After the user approves, add a note to each company quoting the ticket's ask, with its kind, readiness and ticket ID.
6. **Alert the owner** with [slack/post-message](../companies/slack/tools/post-message.md). Post each ask to `am_channel` with the company, the owner ID, the kind, the readiness and the ticket's first line.

## Notes

Support still answers every ticket; this play makes sure a question like "can we add SSO before the security review" also reaches the person who owns the renewal. Post the most ready asks first.

Run it daily with `since` set to the previous run.
