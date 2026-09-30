---
title: Gate outbound drafts behind a Jev evaluation check
summary: Drafts each message with Claude, saves it to Gmail, scores it with Jev, and revises or sends it once it passes.
author: shipgtm
motion: outbound
updated: 2026-09-29
---

## Outcome

- Every drafted message scored against explicit pass/fail questions before it is allowed to send.
- A revised draft for anything that failed, up to the allowed number of attempts.
- Only passed or person-approved messages sent from Gmail; everything else flagged with its reasons.

## Inputs

- `max_revisions`: how many times a failing draft may be rewritten before it goes to a person, e.g. 2
- `min_confidence`: how sure Jev must be before a pass or fail is used without a person, e.g. 0.8

## Steps

1. **Write the draft** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft the outbound message for the lead.
2. **Save it as a draft** with [google/create-draft](../companies/google/tools/create-draft.md). Save the message to the sending account's Gmail as an unsent draft.
3. **Score it** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Ask yes-or-no questions on outbound quality, factual support (no claim the lead's record doesn't back), and whether the next action is appropriate. Keep each answer with its confidence and, for a no, the reason.
4. **Revise on failure** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For a draft with any answer below `min_confidence` or a no, rewrite it with the reasons in view, update the Gmail draft from step 2, then send it back to step 3. Stop after `max_revisions` attempts.
5. **Route what still fails**. Flag every draft still failing after `max_revisions` for a person to fix or approve, with its reasons.
6. **Send what passed** with [google/send-message](../companies/google/tools/send-message.md). Send every message that passed step 3, or was approved by a person.

## Notes

Keep each pass/fail question narrow enough for a careful editor to judge in a second; a vague question like "sounds on-brand" produces an unreliable score.

Adapted from ShipGTM's [GTM agent evaluation guide](https://shipgtm.substack.com/p/the-number-one-reason-your-gtm-agents), which pairs Jev's evaluation model with Claude for drafting and Gmail for sending and replies.
