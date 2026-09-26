---
title: Spot and recover at-risk customer accounts
summary: Detect meaningful usage drops, assemble the account story, and trigger a human check-in before renewal risk grows.
author: thedogwiththedataonit
version: 1
tags:
  - motion:midbound
  - channel:chat
  - channel:email
  - capability:track-product-usage
  - capability:route-alerts
  - capability:write-copy
featured: 9
updated: 2026-09-16
---

## Inputs

- `drop_threshold`: the usage drop that counts, e.g. 40%
- `renewal_window`: how soon renewal is, e.g. 90 days

## Steps

1. **Detect drops** with [mixpanel/track-product-usage](../companies/mixpanel/tools/track-product-usage.md). List accounts whose usage fell more than `drop_threshold` versus the prior 30 days and renew within `renewal_window`.
2. **Escalate** with [slack/route-alerts](../companies/slack/tools/route-alerts.md). Post one message per account to the customer success channel with the usage chart numbers and renewal date.
3. **Draft the check-in** with [brew/write-copy](../companies/brew/tools/write-copy.md). Draft a short check-in email from the account manager for each account. Show the drafts to the user.

## Done when

- Every at-risk account has a Slack post and a drafted email.
- The user has the list ordered by renewal date.
