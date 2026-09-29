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
- A Slack post for each at-risk ticket with its company and HubSpot owner.
- A drafted check-in for each at-risk company, for its owner to send.

## Inputs

- `since`: when the last run ended, so only newer tickets are read, e.g. 2026-09-28
- `risk_level`: the lowest churn-risk level that counts as at risk, e.g. weighing a downgrade or another tool
- `min_confidence`: the confidence below which you judge a ticket yourself, e.g. 0.75
- `risk_tag`: the Zendesk tag that marks an at-risk ticket, e.g. churn_risk
- `cs_channel`: the Slack channel customer success watches, e.g. #cs-alerts

## Steps

1. **Pull new tickets** with [zendesk/search](../companies/zendesk/tools/search.md). Search `type:ticket created>` `since`. Keep each ticket's ID, subject, description, priority and requester's email.
2. **Read each ticket** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the subject and description as the state, with a score `churn_risk` on four levels (no risk; frustrated; weighing a downgrade or another tool; says they will cancel), a choice `issue` of bug, billing, how_to, missing_feature, performance, access and cancellation, a score `urgency` on three levels (can wait; this week; today), a noul `mentions_competitor` and a noul `asks_for_refund`. Keep every answer with its confidence or probability.
3. **Settle the unsure ones**. Show the user every ticket whose `churn_risk` confidence is below `min_confidence`, and keep the level the user picks. Keep the tickets whose most likely `churn_risk` level is `risk_level` or higher.
4. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each at-risk requester's email domain. Keep the company's record ID, name and `hubspot_owner_id`; note the tickets with no match.
5. **Mark the ticket** with [zendesk/update-ticket](../companies/zendesk/tools/update-ticket.md). After the user approves, add `risk_tag` to each at-risk ticket, raise its priority to high, or urgent when its urgency is today, and add an internal note, not a public reply, with the churn-risk level, the issue and the competitor and refund flags.
6. **Alert the owner** with [slack/post-message](../companies/slack/tools/post-message.md). Post each at-risk ticket to `cs_channel` with the company, the owner ID, the churn-risk level, the issue, the flags and the ticket ID.
7. **Draft the check-in**. Write a short note from each company's owner that names the problem in the ticket, says what happens next and offers a call. Show the drafts to the user.

## Notes

Judge risk by the most likely level, not by the expected score between levels, which TypeSafe's docs say is not a magnitude. Start with `risk_level` at weighing a downgrade or another tool, and move it once you have a week of results. Support keeps answering the ticket as usual; this play only makes sure the account owner hears about it the same day.

Run it every few hours with `since` set to the previous run's date.
