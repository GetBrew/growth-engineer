---
title: Gate outbound drafts behind an evaluation check
summary: Scores each draft against pass/fail questions, revises failures, and routes what still fails to a human before it can send.
author: shipgtm
motion: outbound
tags:
  - channel:email
  - channel:chat
updated: 2026-09-29
---

## Outcome

- Every drafted message scored against explicit pass/fail questions before it is allowed to send.
- A revised draft for anything that failed, up to the allowed number of attempts.
- Only passed or human-approved messages added to the campaign; everything else routed to a reviewer with its reasons.

## Inputs

- `campaign`: the Instantly campaign approved messages send through, e.g. Q4 outbound
- `max_revisions`: how many times a failing draft may be rewritten before it goes to a human, e.g. 2
- `reviewer_channel`: the Slack channel that gets drafts still failing after `max_revisions`, e.g. #outbound-review

## Steps

1. **Write the draft**. For each lead, draft the outbound message the campaign calls for.
2. **Score it** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Ask yes-or-no questions on outbound quality, factual support (no claim the lead's record doesn't back), and whether the next action is appropriate. Keep each answer with its confidence and, for a no, the reason.
3. **Revise on failure** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For a draft with any low-confidence or no answer, rewrite it with the reasons in view, then send it back to step 2. Stop after `max_revisions` attempts.
4. **Route what still fails** with [slack/post-message](../companies/slack/tools/post-message.md). Post every draft still failing after `max_revisions` to `reviewer_channel`, with the lead and the reasons, for a human to fix or approve.
5. **Send what passed** with [instantly/add-leads-to-campaign](../companies/instantly/tools/add-leads-to-campaign.md). Add every lead whose draft passed step 2, or was approved in `reviewer_channel`, to `campaign` with the approved line as the personalization variable your template uses.

## Notes

Keep each pass/fail question narrow enough for a careful editor to judge in a second; a vague question like "sounds on-brand" produces an unreliable score.

Adapted from ShipGTM's [GTM agent evaluation guide](https://shipgtm.substack.com/p/the-number-one-reason-your-gtm-agents).
