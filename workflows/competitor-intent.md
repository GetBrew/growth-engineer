---
title: Follow up when accounts research a competitor
summary: Combine what a competitor just shipped with which of your accounts are looking, then send a focused comparison.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 3
updated: 2026-09-16
---

## Inputs

- `competitor_domain`: the competitor to watch, e.g. competitor.example
- `watch_list`: account domains with an open deal

## Steps

1. **Read what changed** with [firecrawl/scrape-web](../companies/firecrawl/tools/scrape-web.md). Fetch the pricing and changelog pages on `competitor_domain` and summarise what changed in the last month in five bullets.
2. **Match open deals** with [attio/manage-crm](../companies/attio/tools/manage-crm.md). Find records in `watch_list` with an open deal. Keep the deal owner and stage.
3. **Write the comparison** with [brew/write-copy](../companies/brew/tools/write-copy.md). Draft one email per account that names a single concrete difference relevant to its stage. Show the drafts to the user; send only after approval.

## Done when

- The user has the five-bullet competitor summary.
- Every open deal has a drafted, approved or declined email.
