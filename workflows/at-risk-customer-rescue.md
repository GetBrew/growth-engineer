---
title: Spot and recover at-risk customer accounts
summary: Detect meaningful usage drops, assemble the account story, and trigger a human check-in before renewal risk grows.
author: thedogwiththedataonit
tags:
  - motion:retention
  - channel:chat
  - channel:email
updated: 2026-09-27
---

## Inputs

- `usage_event`: the Mixpanel event that means real usage, e.g. report_created
- `account_email_property`: the Mixpanel property that holds each account's billing email, e.g. billing_email
- `drop_threshold`: the usage drop that counts, e.g. 40%
- `renewal_window`: how soon renewal is, e.g. 90 days
- `cs_channel`: the Slack channel to escalate in, e.g. #customer-success

## Steps

1. **Detect drops** with [mixpanel/run-query](../companies/mixpanel/tools/run-query.md). Count `usage_event` broken down by `account_email_property`, for the last 30 days and the 30 days before. Keep each billing email whose count fell by more than `drop_threshold`, with both counts.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each billing email, as stored and lowercased. Keep every customer ID it returns; note any email with no customer.
3. **Check renewals** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). For each customer, keep the accounts whose subscription item's `current_period_end` falls within `renewal_window`, with that date.
4. **Escalate** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per at-risk account to `cs_channel` with both usage counts and the renewal date. Ask the user before posting the first one.
5. **Draft the check-in** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft a short, plain-text check-in email from the account manager for each account, naming the drop without blame. Show the drafts to the user.

## Done when

- Every at-risk account renewing within `renewal_window` has a Slack post and a drafted email.
- The user has the list ordered by renewal date, with the emails that matched no Stripe customer.
