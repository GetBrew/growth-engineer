---
title: Email a trial offer to active free users
summary: Finds opted-in free users in PostHog who reached your activation event, skips paying Stripe customers, and emails a trial offer with Brew.
author: thedogwiththedataonit
motion: plg
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- One approved trial-offer email, sent to every opted-in user who reached your activation event and to no paying customer.
- The number of users emailed.

## Inputs

- `activation_event`: the event that marks real usage, e.g. campaign_sent
- `min_events`: how many times they must fire it, e.g. 3
- `lookback_days`: the window to count in, e.g. 14
- `consent_property`: the PostHog person property that is true when someone opted in to marketing email, e.g. marketing_opt_in
- `trial_plan`: the plan to offer, e.g. Pro, 14-day trial
- `trial_url`: where they start it, e.g. https://acme.example/upgrade

## Steps

1. **Find activated users** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). List people whose `consent_property` is true and who fired `activation_event` at least `min_events` times in the last `lookback_days`. Keep each person's email and event count.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each email, as stored and lowercased. Keep every customer ID it returns; people with no customer stay on the list.
3. **Skip paying customers** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). Remove anyone whose customer has a subscription on a paid price that is not canceled. Keep the emails that remain.
4. **Write the email** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email that offers `trial_plan` around what these users already did, linking to `trial_url`. Show it to the user. Keep its `emailVersionId` and subject.
5. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send it to the remaining emails, 50 inline recipients per send, each send with its own idempotency key.
