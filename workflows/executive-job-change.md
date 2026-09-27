---
title: Reach new executives in their first 90 days
summary: Track leadership changes and open a thoughtful conversation while new priorities and budgets are being set.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 2
updated: 2026-09-16
---

## Inputs

- `target_titles`: the roles to watch, e.g. VP Marketing, Head of Growth
- `target_accounts`: company domains to watch, e.g. acme.example, globex.example

## Steps

1. **Find new leaders** with [apollo/find-work-emails](../companies/apollo/tools/find-work-emails.md). Across `target_accounts`, find people with `target_titles` who started in the last 90 days. Keep name, title, start date and work email.
2. **Draft a note** with [anthropic/write-copy](../companies/anthropic/tools/write-copy.md). For each person, draft three lines about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.
3. **Log it** with [hubspot/manage-crm](../companies/hubspot/tools/manage-crm.md). Create or update each contact and attach the approved draft as a note on the record.

## Done when

- Every new leader has a contact record with a note.
- The user has the list with start dates.
