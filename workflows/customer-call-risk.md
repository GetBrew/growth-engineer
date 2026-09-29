---
title: Flag churn risk and competitor talk in customer calls
summary: Reads recent Gong call transcripts, scores churn risk and flags competitor and pricing talk with Jev, and posts the risky calls to Slack.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of the calls recorded since the last run, with each one's type, churn-risk level, flags and Jev's confidence.
- A Slack post for each customer call at or above your risk level, with what was said.
- A drafted next step for each risky call, for its account owner.

## Inputs

- `since`: when the last run ended, so only newer calls are read, e.g. 2026-09-22
- `risk_level`: the lowest churn-risk level that counts as at risk, e.g. weighing a downgrade or another tool
- `min_confidence`: the confidence below which you judge a call yourself, e.g. 0.75
- `cs_channel`: the Slack channel customer success watches, e.g. #renewals

## Steps

1. **Pull the transcripts** with [gong/get-call-transcripts](../companies/gong/tools/get-call-transcripts.md). Get the transcripts of calls recorded from `since` to now. Keep each call's ID and its transcript as speaker turns.
2. **Read each call** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each transcript as the state, with a choice `call_type` of renewal_or_check_in, onboarding, support, new_business and internal, a score `churn_risk` on four levels (no risk; frustrated; weighing a downgrade or another tool; says they will leave), a noul `competitor_mentioned`, a noul `pricing_pushback` and a noul `next_step_agreed`. Keep every answer with its confidence or probability.
3. **Keep the risky calls**. Keep the renewal, check-in, onboarding and support calls whose most likely `churn_risk` level is `risk_level` or higher. Show the user the calls whose `churn_risk` confidence is below `min_confidence`, and keep the level the user picks.
4. **Write the next steps**. For each risky call, draft two lines for its account owner: the concern in the customer's own words, and one next step before the renewal. Show them to the user.
5. **Alert customer success** with [slack/post-message](../companies/slack/tools/post-message.md). Post each risky call to `cs_channel` with its call ID, the churn-risk level, the competitor and pricing flags, whether a next step was agreed, and the drafted next step.

## Notes

Gong's own trackers can flag keywords; this play asks what the customer meant, with a confidence, so "we're looking at a few options" and "we're renewing, just checking prices" land in different places. A call with no agreed next step and a competitor in it is the one to look at first.

A long transcript can pass the request's size limit: send only the customer's turns when it does. Run it weekly with `since` set to the previous run.
