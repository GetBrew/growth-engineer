---
title: Flag churn risk and competitor talk in customer calls
summary: Reads recent Gong call transcripts, scores churn risk and flags competitor and pricing talk with Jev, and posts the risky calls to Slack.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of the calls recorded since the last run, with each one's type, churn-risk level, flags and Jev's confidence.
- A Slack post for each customer call at or above your risk level, with what was said and a drafted next step.

## Inputs

- `since`: when the last run started, so only newer calls are read, e.g. 2026-09-22T09:00:00Z
- `risk_level`: the lowest churn-risk level that counts as at risk, e.g. weighing a downgrade or another tool
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `cs_channel`: the Slack channel customer success watches, e.g. #renewals

## Steps

1. **Pull the transcripts** with [gong/get-call-transcripts](../companies/gong/tools/get-call-transcripts.md). Get the transcripts of calls recorded from `since` to now. Keep each call's ID and its transcript as speaker turns, and look up each call's title and which speakers are from your company, a read-only call, so every turn is marked rep or customer.
2. **Read each call** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each transcript as the state, with a choice `call_type` of renewal_or_check_in, onboarding, support, new_business and internal, a score `churn_risk` on four levels (no risk; frustrated; weighing a downgrade or another tool; says they will leave), a noul `competitor_mentioned`, a noul `pricing_pushback` and a noul `next_step_agreed`. Keep every answer with its confidence or probability.
3. **Check the unsure ones with the user**. Before filtering, show the user every renewal, check-in, onboarding or support call whose `call_type` or `churn_risk` confidence is below `min_confidence`, and keep what the user decides. Keep the renewal_or_check_in, onboarding and support calls whose most likely `churn_risk` level is `risk_level` or higher.
4. **Write the next steps**. For each risky call, draft two lines: the concern in the customer's own words, and one next step. Show them to the user.
5. **Alert customer success** with [slack/post-message](../companies/slack/tools/post-message.md). Post each risky call to `cs_channel` with its title and call ID, the churn-risk level, whether a competitor or pricing pushback came up and a next step was agreed, and the two drafted lines.

## Notes

Gong's trackers flag topics across calls; this adds a churn-risk level with a confidence, which separates "we're looking at a few options" from "we're renewing, just checking prices". Look first at calls with a competitor in them and no agreed next step.

Run it weekly with `since` set to the time the previous run started.
