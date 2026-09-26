---
title: Find more work emails by ordering providers by hit rate
summary: Sample first, then run the waterfall in the order that actually finds emails for your list.
author: thedogwiththedataonit
version: 1
tags:
  - capability:find-work-emails
featured: 11
updated: 2026-09-16
---

## Inputs

- `contacts_table`: the Clay table with name and company domain columns

## Steps

1. **Sample** with [clay/find-work-emails](../companies/clay/tools/find-work-emails.md). 50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate.
2. **Reorder** with [clay/find-work-emails](../companies/clay/tools/find-work-emails.md). the providers from highest to lowest hit rate, stopping at the first verified email.
3. **Run** with [clay/find-work-emails](../companies/clay/tools/find-work-emails.md). the reordered sequence on the full table, after the user confirms.

## Done when

- The table has a verified email column.
- The user has the hit rate for each provider.
