---
title: Follow up when accounts research a competitor
summary: Combine what a competitor just shipped with which of your accounts are looking, then send a focused comparison.
author: thedogwiththedataonit
version: 1
tags:
  - motion:outbound
  - channel:email
  - capability:scrape-web
  - capability:manage-crm
  - capability:write-copy
inputs:
  - name: competitor_domain
    description: the competitor to watch
    example: competitor.example
  - name: watch_list
    description: account domains with an open deal
steps:
  - title: Read what changed
    tool: firecrawl/scrape-web
    instruction: Fetch the pricing and changelog pages on `competitor_domain` and summarise what changed in the last month in five bullets.
  - title: Match open deals
    tool: attio/manage-crm
    instruction: Find records in `watch_list` with an open deal. Keep the deal owner and stage.
  - title: Write the comparison
    tool: brew/write-copy
    instruction: Draft one email per account that names a single concrete difference relevant to its stage. Show the drafts to the user; send only after approval.
doneWhen:
  - The user has the five-bullet competitor summary.
  - Every open deal has a drafted, approved or declined email.
featured: 3
updated: 2026-09-16
---
