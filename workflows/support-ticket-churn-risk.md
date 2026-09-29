---
title: Flag churn risk in new support tickets for customer success
summary: Reads new Zendesk tickets, scores churn risk and urgency with Jev, tags and prioritizes the risky ones, and alerts each owner in Slack.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new ticket with its churn-risk level, issue type, urgency and Jev's confidence.
- Each at-risk ticket tagged, reprioritized and given an internal note in Zendesk.
- A Slack post for each at-risk ticket that mentions its HubSpot owner and carries a drafted check-in.

## Inputs

- `since`: when the last run started, as a time, so only newer tickets are read, e.g. 2026-09-28T09:00:00Z
- `risk_level`: the lowest churn-risk level that counts as at risk, e.g. weighing a downgrade or another tool
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `risk_tag`: the Zendesk tag that marks an at-risk ticket, e.g. churn_risk
- `cs_channel`: the Slack channel customer success watches, e.g. #cs-alerts

## Steps

1. **Pull new tickets** with [zendesk/search](../companies/zendesk/tools/search.md). Search for tickets (`type:ticket`) created after `since`, leaving out those already tagged `risk_tag`. Keep each ticket's ID, subject, description, priority, tags and requester ID.
2. **Read each ticket** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the subject and description as the state, with a score `churn_risk` on four levels (no risk; frustrated; weighing a downgrade or another tool; says they will cancel), a choice `issue` of bug, billing, how_to, missing_feature, performance, access, cancellation and other, a score `urgency` on three levels (can wait; this week; today), a noul `mentions_competitor` and a noul `asks_for_refund`. Keep every answer with its confidence or probability.
3. **Check the unsure ones with the user**. Show the user every ticket whose `churn_risk` confidence is below `min_confidence`, and keep the level the user picks. Keep the tickets whose most likely `churn_risk` level is `risk_level` or higher, and look up each one's requester email, a read-only call.
4. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each at-risk requester's email domain, skipping free email domains. Keep the company's record ID, name and `hubspot_owner_id`, and look up each owner's name and email, a read-only call. Note the tickets with no match.
5. **Mark the ticket** with [zendesk/update-ticket](../companies/zendesk/tools/update-ticket.md). After the user approves, add `risk_tag` alongside each at-risk ticket's existing tags, raise its priority to high, or urgent when its urgency is today, and add an internal note, not a public reply, with the churn-risk level, the issue and the competitor and refund probabilities.
6. **Draft the check-in**. Write a short note from each company's owner, by name, that names the problem in the ticket, says what happens next and offers a call. Show the drafts to the user.
7. **Find the owners in Slack** with [slack/find-user-by-email](../companies/slack/tools/find-user-by-email.md). Look up each owner's email. Keep their Slack user ID.
8. **Alert the owner** with [slack/post-message](../companies/slack/tools/post-message.md). Post each at-risk ticket to `cs_channel`, mentioning its owner, with the company, the churn-risk level, the issue, the competitor and refund probabilities, the ticket ID and the drafted check-in.

## Notes

Judge risk by the most likely level, not by the expected score between levels, which TypeSafe's docs say is not a magnitude. Start with `risk_level` at weighing a downgrade or another tool, and move it once you have a week of results. Support keeps answering the ticket as usual; the account owner hears about it the same day.

Run it every few hours with `since` set to the time the previous run started.
