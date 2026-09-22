---
title: Guide active free users toward their first paid moment
summary: Combine behavioural milestones with timely education so promising users find the value before momentum fades.
author: thedogwiththedataonit
version: 1
tags:
  - motion:plg
  - channel:email
  - capability:track-product-usage
  - capability:collect-payments
  - capability:send-email
inputs:
  - name: activation_event
    description: the event that marks real usage
    example: campaign_sent
  - name: trial_plan
    description: the plan to offer
    example: Pro, 14-day trial
steps:
  - title: Find activated free users
    tool: posthog/track-product-usage
    instruction: List users on the free plan who fired `activation_event` three or more times in the last 14 days.
  - title: Skip paying customers
    tool: stripe/track-revenue
    instruction: Remove anyone with an active subscription.
  - title: Send the sequence
    tool: brew/send-email
    instruction: Draft a two-email sequence explaining `trial_plan` around what they already did. Show it to the user; send after approval.
doneWhen:
  - No paying customer received the sequence.
  - The user has the count of users enrolled.
featured: 8
updated: 2026-09-16
---
