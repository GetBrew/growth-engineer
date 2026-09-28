---
title: Follow up when accounts research a competitor
summary: Combine what a competitor just shipped with which of your accounts are looking, then draft a focused comparison.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: true
updated: 2026-09-27
---

## Inputs

- `competitor_pages`: the competitor's pricing and changelog URLs
- `competitor_name`: the competitor's product name as G2 lists it
- `g2_product_id`: your product's id on G2
- `watch_list`: the domains of accounts with an open deal
- `lookback_days`: how far back to look, e.g. 30

## Steps

1. **Read what changed** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch each page in `competitor_pages` as markdown. Keep a five-bullet summary of what changed within `lookback_days`.
2. **Find who is comparing** with [g2/browse-product-buyer-intent](../companies/g2/tools/browse-product-buyer-intent.md). For `g2_product_id`, list the last `lookback_days` of activity with the `company_domain` and `left_product_name` dimensions. Keep the domains whose `left_product_name` is `competitor_name` and that are also in `watch_list`.
3. **Match open deals** with [attio/list-records](../companies/attio/tools/list-records.md). For those domains, find the deal records that are still open. Keep each deal's owner and stage.
4. **Write the comparison** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Using the summary from step 1, draft one plain-text email per deal that names a single concrete difference relevant to its stage. Show the drafts to the user.

## Done when

- The user has the five-bullet competitor summary.
- Every open deal researching the competitor has a drafted email for its owner.
