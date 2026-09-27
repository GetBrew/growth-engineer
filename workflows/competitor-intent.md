---
title: Follow up when accounts research a competitor
summary: Combine what a competitor just shipped with which of your accounts are looking, then draft a focused comparison.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 3
updated: 2026-09-27
---

## Inputs

- `competitor_domain`: the competitor to watch, e.g. competitor.example
- `g2_product_id`: your product's id on G2
- `watch_list`: account domains with an open deal

## Steps

1. **Read what changed** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch the pricing and changelog pages on `competitor_domain` and summarise what changed in the last month in five bullets.
2. **Find who is comparing** with [g2/browse-product-buyer-intent](../companies/g2/tools/browse-product-buyer-intent.md). From `g2_product_id`, list the companies researching the competitor in the last 30 days (rows whose `left_product_id` is the competitor). Keep those in `watch_list`.
3. **Match open deals** with [attio/list-records](../companies/attio/tools/list-records.md). For those accounts, find the records with an open deal. Keep the deal owner and stage.
4. **Write the comparison** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft one email per account that names a single concrete difference relevant to its stage. Show the drafts to the user.

## Done when

- The user has the five-bullet competitor summary.
- Every open deal researching the competitor has a drafted email.
