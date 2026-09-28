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

- `account_property`: the Amplitude property that holds each account's domain, e.g. company_domain
- `usage_threshold`: the weekly active users that signal a bigger team, e.g. 25
- `lookback_days`: the window to check, e.g. 14
- `ready_attribute`: the Attio company attribute that marks expansion-ready accounts, e.g. expansion_ready
- `sales_channel`: the Slack channel to post in, e.g. #expansion

## Steps

1. **Find accounts over the line** with [amplitude/query-analytics](../companies/amplitude/tools/query-analytics.md). Query weekly active users grouped by `account_property` over the last `lookback_days`. Keep each domain whose weekly active users crossed `usage_threshold`, with the number and the week it crossed.
2. **Mark them** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). For each domain, update the company record matched on its domain, setting `ready_attribute` and a note of the metric and date. Keep each record ID.
3. **Tell sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per account to `sales_channel` with the metric, the week and the Attio record. Ask the user before posting the first one.

## Done when

- Every account over the line is marked in the CRM.
- `sales_channel` has one post per account.
