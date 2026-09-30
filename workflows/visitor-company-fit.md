---
title: Alert sales when an ideal-fit company browses your site
summary: Resolves anonymous PostHog visitors to companies with People Data Labs, judges fit and buying stage with Jev, and alerts sales in Slack.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:website
  - channel:chat
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of the companies behind your anonymous visitors, with the pages each viewed, its fit level, buying stage and Jev's confidence.
- A Slack post for each company that fits and is evaluating or ready to talk, with its HubSpot owner.

## Inputs

- `lookback_days`: the window to read visits from, e.g. 1
- `min_pages`: how many pages one IP address must view to count, e.g. 3
- `max_lookups`: the most IP addresses to resolve in one run, since each match is charged, e.g. 100
- `min_match`: the lowest People Data Labs match confidence to keep, e.g. high
- `ideal_customer`: the companies you sell to, in a sentence or two, e.g. B2B software companies with 50 to 1,000 employees
- `min_fit`: the lowest fit level worth an alert, e.g. good
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8
- `alerts_channel`: the Slack channel to post in, e.g. #sales-signals

## Steps

1. **Find engaged visitors** with [posthog/run-sql-query](../companies/posthog/tools/run-sql-query.md). Select `$pageview` events from the last `lookback_days` by persons with no `email`, grouped by the event's `$ip`, with the distinct `$pathname` values and the view count. Keep the IP addresses with at least `min_pages` pages, with their pages.
2. **Resolve the companies** with [people-data-labs/identify-ip-company](../companies/people-data-labs/tools/identify-ip-company.md). Look up each IP address, up to `max_lookups`, requesting the IP's metadata. Skip VPN, proxy, mobile and hosting addresses and matches below `min_match`. Keep each company's name, website, size and industry, with the pages its visitors viewed.
3. **Judge fit and stage** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each company's facts and pages as the state, with a score `fit` whose levels describe the match with `ideal_customer`: no fit (matches none of it), weak (matches some), good (matches most) and ideal (matches all); and a choice `stage` of researching (blog and docs), evaluating (pricing, comparisons, case studies or security), ready_to_talk (contact or demo pages), existing_customer (the app, login or billing) and job_seeker (careers). Keep each answer with its confidence.
4. **Check the unsure ones with the user**. Show the user the companies whose fit or stage confidence is below `min_confidence`, and keep what the user decides. Keep the companies with a fit of `min_fit` or better that are evaluating or ready to talk.
5. **Find the owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search companies by each website's domain. Keep each company's record ID and `hubspot_owner_id`, and look up each owner's name, a read-only call. Note the ones with no record.
6. **Alert** with [slack/post-message](../companies/slack/tools/post-message.md). Post each kept company to `alerts_channel` with its size, industry, fit level, stage, the pages viewed and its owner's name.

## Notes

Visitor IP addresses are personal data in many places, so run this only if your privacy notice covers sharing them with an enrichment vendor. PostHog keeps the `$ip` property only when the project does not discard client IP data; check the project settings first. The stage comes from which pages were viewed, which is why the pages go into the state alongside the company.

It finds companies, not people: reach the right person through the account owner, never by guessing who visited. Run it daily with `lookback_days` set to 1.
