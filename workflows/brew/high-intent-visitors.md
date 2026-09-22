---
title: Route high-intent website visitors in real time
summary: Identify promising accounts on your site, enrich them, and tell the right owner with useful context.
version: 1
tags:
  - motion:midbound
  - channel:website
  - channel:chat
  - capability:track-intent
  - capability:enrich-contacts
  - capability:route-alerts
inputs:
  - name: pricing_path
    description: the page that signals intent
    example: /pricing
  - name: alerts_channel
    description: where to post
    example: "#sales-signals"
steps:
  - title: Find repeat visitors
    tool: posthog/track-intent
    instruction: List identified accounts that viewed `pricing_path` at least twice in the last 7 days.
  - title: Enrich
    tool: clay/enrich-contacts
    instruction: For each account domain, add company size, industry and any open hiring for sales or marketing.
  - title: Alert
    tool: slack/route-alerts
    instruction: Post one message per account to `alerts_channel` with the enrichment and a suggested owner. Ask the user before posting the first one.
doneWhen:
  - Every qualifying account was posted once, with no duplicates.
  - The user has the list of accounts and suggested owners.
featured: 4
updated: 2026-09-16
---
