---
title: Surface product-qualified expansion opportunities
summary: Watch account usage, flag teams approaching meaningful limits, and give sales a clear reason to engage.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - motion:plg
  - channel:chat
updated: 2026-09-27
---

## Inputs

- `usage_threshold`: the weekly active users that signal a bigger team, e.g. 25
- `plan_limit`: the plan limit accounts approach, e.g. 10 seats
- `sales_channel`: where to post, e.g. #expansion

## Steps

1. **Find accounts near the line** with [amplitude/query-analytics](../companies/amplitude/tools/query-analytics.md). List accounts whose weekly active users crossed `usage_threshold` or reached 80% of `plan_limit` in the last 14 days.
2. **Mark them** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). Set each company record, matched on its domain, to expansion-ready with the metric and the date. Keep each account's owner.
3. **Tell sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per account to `sales_channel` with the metric, the date and the account's owner. Ask the user before posting the first one.

## Done when

- Every account over the line is marked in the CRM.
- `sales_channel` has one post per account.
