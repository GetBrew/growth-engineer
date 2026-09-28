---
title: Flag high-intent website visitors to sales
summary: Identify promising accounts on your site, enrich them, and tell the right owner with useful context.
author: thedogwiththedataonit
tags:
  - motion:midbound
  - channel:website
  - channel:chat
featured: true
updated: 2026-09-27
---

## Inputs

- `pricing_path`: the page that signals intent, e.g. /pricing
- `min_views`: how many views from one company count as intent, e.g. 2
- `lookback_days`: the window to count in, e.g. 7
- `alerts_channel`: the Slack channel to post in, e.g. #sales-signals

## Steps

1. **Find repeat visitors** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). Count `$pageview` events whose `$pathname` is exactly `pricing_path` in the last `lookback_days`, grouped by the domain of each identified person's `email`, leaving out free email domains. Keep the domains with at least `min_views`, with their counts.
2. **Enrich** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each domain, keep the company's name, employee count, industry and latest funding round.
3. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by `domain`. Keep each company's `hubspot_owner_id` and look up that owner's name; note the domains with no record or no owner.
4. **Alert** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per company to `alerts_channel` with the view count, the enrichment and the owner's name.

## Done when

- Every qualifying company was posted once in this run.
- The user has the list of companies with their owners, and the ones with no owner.
