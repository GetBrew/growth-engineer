---
title: Guide active free users toward their first paid moment
summary: Combine behavioural milestones with timely education so promising users find the value before momentum fades.
author: thedogwiththedataonit
tags:
  - motion:plg
  - channel:email
  - capability:track-product-usage
  - capability:collect-payments
  - capability:send-email
featured: 8
updated: 2026-09-16
---

## Inputs

- `activation_event`: the event that marks real usage, e.g. campaign_sent
- `trial_plan`: the plan to offer, e.g. Pro, 14-day trial

## Steps

1. **Find activated free users** with [posthog/track-product-usage](../companies/posthog/tools/track-product-usage.md). List users on the free plan who fired `activation_event` three or more times in the last 14 days.
2. **Skip paying customers** with [stripe/track-revenue](../companies/stripe/tools/track-revenue.md). Remove anyone with an active subscription.
3. **Send the sequence** with [brew/send-email](../companies/brew/tools/send-email.md). Draft a two-email sequence explaining `trial_plan` around what they already did. Show it to the user; send after approval.

## Done when

- No paying customer received the sequence.
- The user has the count of users enrolled.
