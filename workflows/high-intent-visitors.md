---
title: Route high-intent website visitors in real time
summary: Identify promising accounts on your site, enrich them, and tell the right owner with useful context.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - channel:website
  - channel:chat
featured: 4
updated: 2026-09-16
---

## Inputs

- `pricing_path`: the page that signals intent, e.g. /pricing
- `alerts_channel`: where to post, e.g. #sales-signals

## Steps

1. **Find repeat visitors** with [posthog/track-intent](../companies/posthog/tools/track-intent.md). List identified accounts that viewed `pricing_path` at least twice in the last 7 days.
2. **Enrich** with [clay/enrich-contacts](../companies/clay/tools/enrich-contacts.md). For each account domain, add company size, industry and any open hiring for sales or marketing.
3. **Alert** with [slack/route-alerts](../companies/slack/tools/route-alerts.md). Post one message per account to `alerts_channel` with the enrichment and a suggested owner. Ask the user before posting the first one.

## Done when

- Every qualifying account was posted once, with no duplicates.
- The user has the list of accounts and suggested owners.
