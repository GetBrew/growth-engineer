---
title: Reconnect when a product champion changes jobs
summary: Track past champions, identify their new company, and reopen the relationship with the context you already earned.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:linkedin
  - channel:email
  - capability:find-work-emails
  - capability:enrich-contacts
  - capability:manage-crm
featured: 10
updated: 2026-09-16
---

## Inputs

- `champion_list`: names and previous companies of past champions

## Steps

1. **Detect the move** with [apollo/enrich-contacts](../companies/apollo/tools/enrich-contacts.md). For each person in `champion_list`, find their current company and title. Keep only people who moved in the last 6 months.
2. **Size the new company** with [clay/enrich-contacts](../companies/clay/tools/enrich-contacts.md). For each new company, add size, industry and funding stage.
3. **Open a deal** with [attio/manage-crm](../companies/attio/tools/manage-crm.md). Create a deal on the new company with the champion as the contact and the previous relationship in the notes.

## Done when

- Every champion who moved has a deal on their new company.
- The user has the list of moves.
