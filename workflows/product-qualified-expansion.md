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

- `amplitude_project_id`: the Amplitude project to query
- `account_property`: the Amplitude user property that holds each account's domain, e.g. company_domain
- `usage_threshold`: the weekly active users that signal a bigger team, e.g. 25
- `lookback_days`: the window to check, in full weeks, e.g. 14
- `ready_attribute`: the Attio company checkbox that marks expansion-ready accounts, e.g. expansion_ready
- `sales_channel`: the Slack channel to post in, e.g. #expansion

## Steps

1. **Find accounts over the line** with [amplitude/query-analytics](../companies/amplitude/tools/query-analytics.md). In `amplitude_project_id`, query weekly active users grouped by `account_property`, for each full week in the last `lookback_days`. Keep each domain with a week at or above `usage_threshold`, with the number and the week.
2. **Find their records** with [attio/list-records](../companies/attio/tools/list-records.md). For each domain, find the company record. Keep its record ID and name; note the domains with no record.
3. **Mark them** with [attio/update-record](../companies/attio/tools/update-record.md). Set `ready_attribute` to true on each record ID.
4. **Note the reason** with [attio/create-note](../companies/attio/tools/create-note.md). Add a note to each record with the weekly active users and the week.
5. **Tell sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per account to `sales_channel` with its name, the metric and the week.

## Done when

- Every account over the line is marked and noted in the CRM.
- `sales_channel` has one post per account, and the user has the domains with no record.
