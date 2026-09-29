---
title: Flag expansion asks in support tickets for account owners
summary: Finds new Zendesk tickets that ask for seats, SSO, higher limits or another team with Jev, and notes each in HubSpot for its owner.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new ticket that asks for more, with what kind of expansion it is, its company and Jev's confidence.
- A note on each company's HubSpot record quoting the ask.
- A Slack post for each expansion ask that mentions the company's owner.

## Inputs

- `since`: when the last run started, as a time, so only newer tickets are read, e.g. 2026-09-28T09:00:00Z
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `am_channel`: the Slack channel account managers watch, e.g. #expansion

## Steps

1. **Pull new tickets** with [zendesk/search](../companies/zendesk/tools/search.md). Search for tickets (`type:ticket`) created after `since`. Keep each ticket's ID, subject, description and requester ID.
2. **Spot the asks** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each subject and description as the state, with a noul `expansion` (asks for something that means buying more), a choice `kind` of more_seats, sso_or_security_review, higher_limits (more usage than the plan allows), new_team_or_use_case, api_access, plan_upgrade and none, and a score `readiness` on three levels (asking what is possible; comparing plans; ready to buy). Keep every answer with its confidence or probability.
3. **Check the unsure ones with the user**. Keep the tickets whose `expansion` is yes. Show the user the ones whose `expansion` is unsure or whose kind confidence is below `min_confidence`, and keep what the user decides. Look up each kept ticket's requester email, a read-only call.
4. **Find the account** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each requester's email domain, skipping personal email domains. Keep the company's record ID, name and `hubspot_owner_id`, and look up each owner's name and email, a read-only call. Note the tickets with no match.
5. **Note the ask** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). After the user approves, add a note to each company quoting the ticket's ask, with its kind, readiness and ticket ID.
6. **Find the owners in Slack** with [slack/find-user-by-email](../companies/slack/tools/find-user-by-email.md). Look up each owner's email. Keep their Slack user ID.
7. **Alert the owner** with [slack/post-message](../companies/slack/tools/post-message.md). Post each ask to `am_channel`, mentioning the company's owner, with the company, the kind, the readiness and the ticket's first line, the most ready first.

## Notes

Support still answers every ticket; a question like "can we add SSO before the security review" also reaches the person who owns the renewal.

Run it daily with `since` set to the time the previous run started.
