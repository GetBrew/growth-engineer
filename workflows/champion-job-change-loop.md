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
3. **Add them to the CRM** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). Create or update each new company, matched on its domain, and each champion, matched on their email.
4. **Open a deal** with [attio/create-record](../companies/attio/tools/create-record.md). Create a deal on the new company with the champion as the contact.
5. **Note the history** with [attio/create-note](../companies/attio/tools/create-note.md). Add a note to each deal describing the previous relationship.
6. **Draft the outreach** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). For each champion, draft a short note for LinkedIn or email that congratulates them and names the work you did together. Show the drafts to the user.

## Done when

- Every champion who moved has a deal on their new company.
- Each has a drafted note, and the user has the list of moves.
