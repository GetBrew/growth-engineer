---
title: Reconnect when a product champion changes jobs
summary: Track past champions, identify their new company, and reopen the relationship with the context you already earned.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:linkedin
  - channel:email
updated: 2026-09-27
---

## Inputs

- `champion_list`: past champions, each with a name, previous company domain and what you worked on together
- `moved_within`: how recent a move counts, e.g. 6 months

## Steps

1. **Detect the move** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each person in `champion_list` on name and previous company domain. Keep people whose current employer is a different company that they joined within `moved_within`, with their title, new company domain and work email.
2. **Size the new company** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each new company domain, keep its employee count, industry and latest funding round.
3. **Add them to the CRM** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). Create or update each new company, matched on its domain, and each champion, matched on their work email. Keep both record IDs.
4. **Open a deal** with [attio/create-record](../companies/attio/tools/create-record.md). Create a deal on each new company record with the champion's record as the contact. Keep the deal's record ID.
5. **Note the history** with [attio/create-note](../companies/attio/tools/create-note.md). Add a note to each deal saying what you worked on together, from `champion_list`.
6. **Draft the outreach** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For each champion, draft a short LinkedIn message and a short email that congratulate them and name the work you did together. Show the drafts to the user.

## Done when

- Every champion who moved has a deal on their new company with a note.
- Each has drafted messages, and the user has the list of moves.
