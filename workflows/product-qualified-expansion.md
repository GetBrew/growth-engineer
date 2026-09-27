---
title: Surface product-qualified expansion opportunities
summary: Watch account usage, flag teams approaching meaningful limits, and give sales a clear reason to engage.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - motion:plg
  - channel:email
featured: 7
updated: 2026-09-16
---

## Inputs

- `usage_threshold`: the weekly active users that signal a bigger team, e.g. 25
- `plan_limit`: the plan limit accounts approach, e.g. 10 seats

## Steps

1. **Find accounts near the line** with [amplitude/track-product-usage](../companies/amplitude/tools/track-product-usage.md). List accounts whose weekly active users crossed `usage_threshold` or reached 80% of `plan_limit` in the last 14 days.
2. **Mark them** with [attio/manage-crm](../companies/attio/tools/manage-crm.md). Set each company record to expansion-ready with the metric and the date.
3. **Brief the owner** with [brew/send-email](../companies/brew/tools/send-email.md). Send each account owner one email listing their expansion-ready accounts with the numbers. Ask the user before sending.

## Done when

- Every account over the line is marked in the CRM.
- Each owner received one summary.
