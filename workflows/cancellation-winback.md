---
title: Win back canceled customers with an offer for why they left
summary: Reads why each Stripe subscription was canceled, sorts the reason with Jev, and emails a win-back offer that fits it with Resend.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every recent cancellation with its reason, whether it leaves the door open, the offer picked and Jev's confidence.
- An approved win-back email sent to each customer who got an offer.
- The customers left out, with why.

## Inputs

- `lookback_days`: how recent a cancellation counts, e.g. 14
- `offers`: the offer for each reason, e.g. too_expensive: 30% off for three months with the code COMEBACK30; low_usage: a free setup call; too_complex: a free setup call; missing_feature: a note when it ships; temporary_need: a free month when they return
- `from_address`: the verified Resend sender the emails come from, e.g. Sam at Acme <sam@acme.com>
- `min_confidence`: the confidence below which you pick the reason yourself, e.g. 0.75

## Steps

1. **Pull cancellations** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). List subscriptions with status `canceled` and each customer expanded, and keep those canceled in the last `lookback_days`. Keep each customer's name and email, the plan, how long they subscribed, and the subscription's `cancellation_details` feedback and comment.
2. **Sort the reasons** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each cancellation's feedback, comment, plan and tenure as the state, with a choice `reason` of too_expensive, missing_feature, low_usage, switched_to_competitor, too_complex, support_problem, temporary_need, business_closed and other, and a noul `door_open` (the comment names something that would bring them back). Keep each reason, its confidence and `door_open`.
3. **Pick the offers**. Show the user every cancellation whose reason confidence is below `min_confidence`, and keep the reason the user picks. Give each customer the offer in `offers` for their reason; leave out business_closed, switched_to_competitor without an open door, anyone with no offer for their reason, and anyone who unsubscribed from your emails.
4. **Write the emails**. Draft three or four plain sentences per customer: say what they told you in their own words, make the one offer for their reason, and end with a reply or a link to come back. Show the drafts to the user.
5. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each email from `from_address` to its customer, with an idempotency key per customer.

## Notes

Matching the offer to the reason is the play: a discount answers price, a setup call answers low usage or complexity, and a customer who switched to a competitor is usually better left alone. Stripe's own feedback values are broad; the free-text comment is where the reason is, which is why Jev reads both.

A cancellation with no comment and no feedback gets other; send those a plain note asking what would have kept them, not an offer. Run it weekly with `lookback_days` set to 7.
