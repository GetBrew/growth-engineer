---
title: Surface product-qualified expansion opportunities
summary: Watch account usage, flag teams approaching meaningful limits, and give sales a clear reason to engage.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - motion:plg
  - channel:chat
featured: 7
updated: 2026-09-27
---

## Inputs

- `usage_threshold`: the weekly active users that signal a bigger team, e.g. 25
- `plan_limit`: the plan limit accounts approach, e.g. 10 seats

## Steps

1. **Find accounts near the line** with [amplitude/query-analytics](../companies/amplitude/tools/query-analytics.md). List accounts whose weekly active users crossed `usage_threshold` or reached 80% of `plan_limit` in the last 14 days.
2. **Mark them** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). Set each company record, matched on its domain, to expansion-ready with the metric and the date.
3. **Find each owner** with [slack/find-user-by-email](../companies/slack/tools/find-user-by-email.md). Look up each account owner's email in Slack.
4. **Brief the owner** with [slack/post-message](../companies/slack/tools/post-message.md). Send each owner one direct message listing their expansion-ready accounts with the numbers. Ask the user before sending.

## Done when

- Every account over the line is marked in the CRM.
- Each owner received one summary.
