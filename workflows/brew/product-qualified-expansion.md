---
title: Surface product-qualified expansion opportunities
summary: Watch account usage, flag teams approaching meaningful limits, and give sales a clear reason to engage.
version: 1
tags:
  - motion:midbound
  - motion:plg
  - channel:email
  - capability:track-product-usage
  - capability:manage-crm
  - capability:send-email
inputs:
  - name: usage_threshold
    description: the weekly active users that signal a bigger team
    example: "25"
  - name: plan_limit
    description: the plan limit accounts approach
    example: 10 seats
steps:
  - title: Find accounts near the line
    tool: amplitude/track-product-usage
    instruction: List accounts whose weekly active users crossed `usage_threshold` or reached 80% of `plan_limit` in the last 14 days.
  - title: Mark them
    tool: attio/manage-crm
    instruction: Set each company record to expansion-ready with the metric and the date.
  - title: Brief the owner
    tool: brew/send-email
    instruction: Send each account owner one email listing their expansion-ready accounts with the numbers. Ask the user before sending.
doneWhen:
  - Every account over the line is marked in the CRM.
  - Each owner received one summary.
featured: 7
updated: 2026-09-16
---
