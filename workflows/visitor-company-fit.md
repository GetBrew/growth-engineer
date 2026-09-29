---
title: Alert sales when an ideal-fit company browses your site
summary: Resolves anonymous PostHog visitors to companies with People Data Labs, judges fit and buying stage with Jev, and alerts sales in Slack.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:website
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of the companies behind your anonymous visitors, with the pages each viewed, its fit level, buying stage and Jev's confidence.
- A Slack post for each good or ideal fit that is evaluating or ready to talk, with its HubSpot owner.

## Inputs

- `lookback_days`: the window to read visits from, e.g. 1
- `min_pages`: how many pages one visitor must view to count, e.g. 3
- `max_lookups`: the most IP addresses to resolve in one run, since each match is charged, e.g. 100
- `ideal_customer`: the companies you sell to, in a sentence or two, e.g. B2B software companies with 50 to 1,000 employees
- `min_confidence`: the confidence below which you judge a company yourself, e.g. 0.75
- `alerts_channel`: the Slack channel to post in, e.g. #sales-signals

## Steps

1. **Find engaged visitors** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). Select `$pageview` events from the last `lookback_days` by persons with no `email`, grouped by the event's `$ip`, with the distinct `$pathname` values and the view count. Keep the IP addresses with at least `min_pages` pages, with their pages.
2. **Resolve the companies** with [people-data-labs/identify-ip-company](../companies/people-data-labs/tools/identify-ip-company.md). Look up each IP address, up to `max_lookups`. Skip VPN, proxy, mobile and hosting addresses and low-confidence matches. Keep each company's name, website, size and industry, with the pages its visitors viewed.
3. **Judge fit and stage** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each company's facts and pages as the state, with a score `fit` against `ideal_customer` on four levels (no fit, weak, good, ideal) and a choice `stage` of researching (blog and docs), evaluating (pricing, comparisons, case studies or security), ready_to_talk (contact or demo pages), existing_customer (the app, login or billing) and job_seeker (careers). Keep each answer with its confidence.
4. **Settle the unsure ones**. Show the user the companies whose fit or stage confidence is below `min_confidence`, and keep what the user decides. Keep the good and ideal fits that are evaluating or ready to talk.
5. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each website's domain. Keep each company's record ID and `hubspot_owner_id`; note the ones with no record.
6. **Alert** with [slack/post-message](../companies/slack/tools/post-message.md). Post each kept company to `alerts_channel` with its size, industry, fit level, stage, the pages viewed and the owner ID.

## Notes

PostHog keeps the `$ip` property only when the project does not discard client IP data; check the project settings first. The stage comes from which pages were viewed, which is why the pages go into the state alongside the company.

This play finds companies, not people: reach the right person through the account owner or a separate search, never by guessing who visited.
