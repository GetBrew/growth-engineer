---
title: Spot and recover at-risk customer accounts
summary: Detect meaningful usage drops, assemble the account story, and trigger a human check-in before renewal risk grows.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - channel:chat
  - channel:email
featured: 9
updated: 2026-09-27
---

## Inputs

- `drop_threshold`: the usage drop that counts, e.g. 40%
- `renewal_window`: how soon renewal is, e.g. 90 days
- `cs_channel`: where to escalate, e.g. #customer-success

## Steps

1. **Detect drops** with [mixpanel/run-query](../companies/mixpanel/tools/run-query.md). List accounts whose usage fell more than `drop_threshold` versus the prior 30 days. Keep an email for each account, such as its admin's.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each email, as stored and lowercased, and keep every customer ID it returns.
3. **Check renewals** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). For each customer, keep the accounts whose subscription item's `current_period_end` falls within `renewal_window`.
4. **Escalate** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per account to `cs_channel` with the usage numbers and renewal date.
5. **Draft the check-in** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft a short check-in email from the account manager for each account. Show the drafts to the user.

## Done when

- Every at-risk account has a Slack post and a drafted email.
- The user has the list ordered by renewal date.
