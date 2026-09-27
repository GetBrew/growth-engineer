---
title: Reconnect when a product champion changes jobs
summary: Track past champions, identify their new company, and reopen the relationship with the context you already earned.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:linkedin
  - channel:email
featured: 10
updated: 2026-09-27
---

## Inputs

- `champion_list`: names and previous companies of past champions

## Steps

1. **Detect the move** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). For each person in `champion_list`, find their current company and title. Keep only people who moved in the last 6 months.
2. **Size the new company** with [clay/run-routine](../companies/clay/tools/run-routine.md). For each new company, add size, industry and funding stage.
3. **Open a deal** with [attio/create-record](../companies/attio/tools/create-record.md). Create a deal on the new company with the champion as the contact.
4. **Note the history** with [attio/create-note](../companies/attio/tools/create-note.md). Add a note to each deal describing the previous relationship.

## Done when

- Every champion who moved has a deal on their new company.
- The user has the list of moves.
