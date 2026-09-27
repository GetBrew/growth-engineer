---
title: Reach new executives in their first 90 days
summary: Track leadership changes and open a thoughtful conversation while new priorities and budgets are being set.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 2
updated: 2026-09-27
---

## Inputs

- `target_titles`: the roles to watch, e.g. VP Marketing, Head of Growth
- `target_accounts`: company domains to watch, e.g. acme.example, globex.example

## Steps

1. **Find new leaders** with [apollo/search-people](../companies/apollo/tools/search-people.md). Across `target_accounts`, find people with `target_titles`.
2. **Get their details** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich them, up to 10 per call. Keep people who started in the last 90 days, with name, title, start date and work email.
3. **Draft a note** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For each person, draft three lines about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.
4. **Log it** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update each contact.
5. **Attach the note** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Attach each approved draft as a note on its contact.

## Done when

- Every new leader has a contact record with a note.
- The user has the list with start dates.
