---
title: Guide active free users toward their first paid moment
summary: Combine behavioural milestones with timely education so promising users find the value before momentum fades.
author: thedogwiththedataonit
tags:
  - motion:plg
  - channel:email
featured: 8
updated: 2026-09-27
---

## Inputs

- `activation_event`: the event that marks real usage, e.g. campaign_sent
- `trial_plan`: the plan to offer, e.g. Pro, 14-day trial

## Steps

1. **Find activated free users** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). List users on the free plan who fired `activation_event` three or more times in the last 14 days.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each user's email and keep their customer ID.
3. **Skip paying customers** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). Remove anyone whose customer has an active subscription.
4. **Write the email** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft one email explaining `trial_plan` around what they already did. Show it to the user.
5. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send it to the remaining users.

## Done when

- No paying customer received the email.
- The user has the count of users emailed.
