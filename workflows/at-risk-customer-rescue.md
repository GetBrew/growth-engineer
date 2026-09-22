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
inputs:
  - name: drop_threshold
    description: the usage drop that counts
    example: 40%
  - name: renewal_window
    description: how soon renewal is
    example: 90 days
steps:
  - title: Detect drops
    tool: mixpanel/track-product-usage
    instruction: List accounts whose usage fell more than `drop_threshold` versus the prior 30 days and renew within `renewal_window`.
  - title: Escalate
    tool: slack/route-alerts
    instruction: Post one message per account to the customer success channel with the usage chart numbers and renewal date.
  - title: Draft the check-in
    tool: brew/write-copy
    instruction: Draft a short check-in email from the account manager for each account. Show the drafts to the user.
doneWhen:
  - Every at-risk account has a Slack post and a drafted email.
  - The user has the list ordered by renewal date.
featured: 9
updated: 2026-09-16
---
