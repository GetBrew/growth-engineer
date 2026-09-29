---
title: Alert sales when a company keeps viewing your pricing page
summary: Counts pricing-page views by company in PostHog, sizes each company with Apollo, and posts it to Slack with its HubSpot owner.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:website
  - channel:chat
featured: true
updated: 2026-09-29
---

## Outcome

- One Slack post for each company that viewed your pricing page often enough, with the count, the company facts and its HubSpot owner.
- The list of those companies, with the ones that have no HubSpot record or owner.

## Inputs

- `pricing_path`: the page that signals intent, e.g. /pricing
- `min_views`: how many views from one company count as intent, e.g. 2
- `lookback_days`: the window to count in, e.g. 7
- `alerts_channel`: the Slack channel to post in, e.g. #sales-signals

## Steps

1. **Find repeat visitors** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). Count `$pageview` events whose `$pathname` is exactly `pricing_path` in the last `lookback_days`, grouped by the domain of each identified person's `email`, leaving out free email domains. Keep the domains with at least `min_views`, with their counts.
2. **Enrich** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each domain, keep the company's name, employee count, industry and latest funding round.
3. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by `domain`. Keep each company's record ID and `hubspot_owner_id`; note the domains with no record or no owner.
4. **Alert** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per company to `alerts_channel` with the view count, the enrichment, the HubSpot record ID and the owner ID.
