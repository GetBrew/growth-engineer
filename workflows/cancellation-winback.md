---
title: Win back canceled customers with an offer for why they left
summary: Reads why each Stripe subscription was canceled, sorts the reason with Jev, and emails a win-back offer that fits it with Resend.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:email
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of every recent cancellation with its reason, whether it leaves the door open, the offer picked and Jev's confidence.
- An approved win-back email sent to each customer who got an offer and opted in to marketing email.
- The customers left out, with why.

## Inputs

- `lookback_days`: how recent a cancellation counts, e.g. 14
- `offers`: the offer for each reason, with any promotion code already created in Stripe, e.g. too_expensive: 30% off for three months with the code COMEBACK30; low_usage: a free setup call; too_complex: a free setup call; missing_feature: a note when it ships; temporary_need: a free month when they return
- `comeback_link`: the page where a customer restarts their subscription, e.g. https://app.acme.com/billing
- `consent_source`: where you record who opted in to marketing email, e.g. a Stripe customer metadata field, or an export of opted-in addresses from your email tool
- `from_address`: the verified Resend sender the emails come from, e.g. Sam at Acme <sam@acme.com>
- `postal_address`: the mailing address every marketing email carries, e.g. Acme Inc., 1 Main St, Springfield, IL 62701
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it

## Steps

1. **Pull cancellations** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). List subscriptions with status `canceled`, each customer expanded, and page through them. Keep those whose `ended_at` falls in the last `lookback_days` and whose `cancellation_details.reason` is `cancellation_requested`, with each customer's name and email, the plan, how long they subscribed, and the cancellation feedback and comment; list the rest as left out.
2. **Sort the reasons** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each cancellation's feedback, comment, plan and tenure as the state, with a choice `reason` of too_expensive (price or budget), missing_feature (needs something the product lacks), low_usage (did not use it enough), switched_to_competitor (moved to another product), too_complex (hard to set up or use), support_problem (unhappy with help received), temporary_need (a project or season ended), business_closed (the company closed or was acquired) and other, and a noul `door_open` (the comment names something that would bring them back). Keep each reason, its confidence and `door_open`.
3. **Pick the offers**. Show the user every cancellation whose reason confidence is below `min_confidence` or whose `door_open` is unsure, and keep what the user decides. Give each customer the offer in `offers` for their reason. Leave out business_closed, switched_to_competitor unless `door_open` is yes, anyone with no offer for their reason and anyone `consent_source` doesn't show as opted in, and list each with why. Confirm the consent list with the user.
4. **Write the emails**. For each customer, draft a subject line and three or four plain sentences: say what they told you in their own words, make the one offer for their reason, link to `comeback_link`, and end with a line to opt out of these emails and `postal_address`. Show the drafts to the user.
5. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each email from `from_address` to its customer, with an idempotency key per customer.

## Notes

Each offer answers one reason: a discount for price, a setup call for low usage or complexity. A customer who switched to a competitor is usually better left alone. Stripe's own feedback values are broad; the free-text comment is where the detail is, which is why Jev reads both. Customers whose subscriptions ended over a failed payment or a dispute need a billing fix, not an offer, so step 1 leaves them out.

Run it weekly with `lookback_days` set to 7.
