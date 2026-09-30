---
title: Reach new executives in their first 90 days
summary: Finds leaders who recently started at your target accounts, drafts a short no-pitch note for each, and logs them in HubSpot.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
featured: true
added: 2026-09-22
updated: 2026-09-29
---

## Outcome

- A three-line note for each new leader, drafted for you to send from your own inbox.
- A HubSpot contact with its note for each leader whose draft you approve.
- The leaders with their start dates, and how many people were enriched or left out.

## Inputs

- `target_titles`: the roles to watch, e.g. VP Marketing, Head of Growth
- `target_accounts`: company domains to watch, e.g. acme.example, globex.example
- `new_role_days`: how new the role must be, e.g. 90
- `max_enrichments`: the most people to enrich in one run, since each costs credits, e.g. 50

## Steps

1. **Find the leaders** with [apollo/search-people](../companies/apollo/tools/search-people.md). Across `target_accounts`, find people with `target_titles`, most senior first. Keep each person's Apollo id, name and company.
2. **Get their details** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich them in that order, up to 10 per call and no more than `max_enrichments` in all. Keep the people who started their current role within `new_role_days`, with name, title, start date and work email.
3. **Write a note**. For each person, draft three lines, for the user to send from their own inbox, about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.
4. **Log the contact** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update each person whose draft the user approved, matched on email. Keep each contact's HubSpot ID.
5. **Attach the note** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Attach each approved draft as a note on its contact ID.
