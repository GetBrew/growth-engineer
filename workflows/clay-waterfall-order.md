---
title: Find more work emails by ordering providers by hit rate
summary: Sample first, then run the waterfall in the order that actually finds emails for your list.
author: thedogwiththedataonit
status: draft
updated: 2026-09-27
---

## Inputs

- `contacts_table`: the Clay table with name and company domain columns

## Steps

1. **Sample** with [clay/run-routine](../companies/clay/tools/run-routine.md). Run each email provider on 50 rows from `contacts_table`. Record each provider's hit rate.
2. **Reorder** with [clay/run-routine](../companies/clay/tools/run-routine.md). Order the providers from highest to lowest hit rate, stopping at the first verified email.
3. **Run** with [clay/run-routine](../companies/clay/tools/run-routine.md). Run the reordered sequence on the full table, after the user confirms.

## Done when

- The table has a verified email column.
- The user has the hit rate for each provider.
