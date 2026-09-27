---
title: Route high-intent website visitors to their owners
summary: Identify promising accounts on your site, enrich them, and tell the right owner with useful context.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - channel:website
  - channel:chat
featured: 4
updated: 2026-09-27
---

## Inputs

- `pricing_path`: the page that signals intent, e.g. /pricing
- `alerts_channel`: where to post, e.g. #sales-signals

## Steps

1. **Find repeat visitors** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). List identified accounts that viewed `pricing_path` at least twice in the last 7 days.
2. **Enrich** with [clay/run-routine](../companies/clay/tools/run-routine.md). For each account domain, add company size, industry and any open hiring for sales or marketing.
3. **Alert** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per account to `alerts_channel` with the enrichment and a suggested owner. Ask the user before posting the first one.

## Done when

- Every qualifying account was posted once, with no duplicates.
- The user has the list of accounts and suggested owners.
