---
title: Guide active free users toward their first paid moment
summary: Combine behavioural milestones with timely education so promising users find the value before momentum fades.
author: thedogwiththedataonit
tags:
  - motion:plg
  - channel:email
updated: 2026-09-27
---

## Inputs

- `activation_event`: the event that marks real usage, e.g. campaign_sent
- `min_events`: how many times they must fire it, e.g. 3
- `lookback_days`: the window to count in, e.g. 14
- `trial_plan`: the plan to offer, e.g. Pro, 14-day trial

## Steps

1. **Find activated users** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). List users who fired `activation_event` at least `min_events` times in the last `lookback_days`. Keep each user's email and event count.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each email, as stored and lowercased. Keep every customer ID it returns.
3. **Skip paying customers** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). Remove anyone whose customer has an active subscription. Keep the emails that remain.
4. **Write the email** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email that offers `trial_plan` around what these users already did. Show it to the user. Keep its `emailId`.
5. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send `emailId` to the remaining emails as inline recipients.

## Done when

- No paying customer received the email.
- The user has the count of users emailed.
