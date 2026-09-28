---
title: Reach new executives in their first 90 days
summary: Track leadership changes and open a thoughtful conversation while new priorities and budgets are being set.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: true
updated: 2026-09-27
---

## Inputs

- `target_titles`: the roles to watch, e.g. VP Marketing, Head of Growth
- `target_accounts`: company domains to watch, e.g. acme.example, globex.example
- `new_role_days`: how new the role must be, e.g. 90
- `max_enrichments`: the most people to enrich in one run, since each costs credits, e.g. 50

## Steps

1. **Find the leaders** with [apollo/search-people](../companies/apollo/tools/search-people.md). Across `target_accounts`, find people with `target_titles`. Keep each person's Apollo id, name and company.
2. **Get their details** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich them, up to 10 per call and no more than `max_enrichments` in total. Keep the people who started their current role within `new_role_days`, with name, title, start date and work email.
3. **Draft a note** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For each person, draft three lines about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.
4. **Log the contact** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update each person with an approved draft, matched on email. Keep each contact's HubSpot ID.
5. **Attach the note** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Attach each approved draft as a note on its contact ID.

## Done when

- Every new leader has a contact record with a note.
- The user has the list with start dates, and how many people were enriched.
