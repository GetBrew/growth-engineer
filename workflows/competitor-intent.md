---
title: Follow up when accounts research a competitor
summary: Reads a competitor's pricing and changelog, finds your open deals comparing them on G2, and drafts a comparison email for each owner.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
featured: true
added: 2026-09-22
updated: 2026-09-29
---

## Outcome

- A five-bullet summary of the competitor's current plans and recent changes.
- A drafted comparison email for each open deal whose company is researching the competitor, for its owner to send.

## Inputs

- `competitor_pages`: the competitor's pricing page and changelog URLs
- `competitor_name`: the competitor's product name as G2 lists it
- `our_differentiators`: what your product does better, e.g. native HubSpot sync, no per-seat pricing
- `g2_product_id`: your product's id on G2
- `open_stages`: the Attio deal stages that count as open, e.g. Discovery, Proposal
- `lookback_days`: how far back to look, e.g. 30

## Steps

1. **Read their pages** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch each page in `competitor_pages` as markdown. Keep five bullets: the current plans and prices, and the changelog entries dated within `lookback_days`.
2. **Find who is comparing** with [g2/browse-product-buyer-intent](../companies/g2/tools/browse-product-buyer-intent.md). For `g2_product_id`, list the last `lookback_days` of buyer intent with the `company_domain` and `left_product_name` dimensions. Keep the domains whose `left_product_name` is `competitor_name`.
3. **Match open deals** with [attio/list-records](../companies/attio/tools/list-records.md). List the deals in `open_stages` whose company's domain is one of those. Keep each deal's name, stage, owner and main contact.
4. **Write the comparison**. Using the bullets from step 1 and `our_differentiators`, draft one plain-text email per deal, for its owner to send to the main contact, that names one concrete difference that matters at the deal's stage. Show the drafts to the user.
