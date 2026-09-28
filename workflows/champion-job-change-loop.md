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

- `champion_list`: past champions, each with a name, their previous company domain, a LinkedIn URL or old work email, and what you worked on together
- `moved_within`: how recent a move counts, e.g. 6 months
- `deal_stage`: the Attio deal stage new deals start in, e.g. Lead
- `deal_owner`: the email of the Attio workspace member who owns the new deals

## Steps

1. **Detect the move** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each champion on their LinkedIn URL or old work email, else on name and previous domain. Keep the people whose current employer's domain differs from the previous one and who started there within `moved_within`, with their title, new company domain and work email.
2. **Size the new company** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each new company domain, keep its name, employee count, industry and latest funding round.
3. **Add them to the CRM** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). Create or update each new company, matched on `domains`, then each champion, matched on `email_addresses` and linked to their new company. Keep both record IDs.
4. **Open a deal** with [attio/create-record](../companies/attio/tools/create-record.md). Skip companies that already have an open deal. For the rest, create a deal named after the company and champion, at `deal_stage`, owned by `deal_owner`, with the company and the champion associated. Keep each deal's record ID.
5. **Note the history** with [attio/create-note](../companies/attio/tools/create-note.md). Add a note to each new deal saying what you worked on together, from `champion_list`.
6. **Write the outreach**. For each champion, draft a short LinkedIn message and a short email that congratulate them and name the work you did together. Show the drafts to the user.

## Done when

- Every champion who moved has an open deal on their new company, with a note on the new ones.
- Each has drafted messages, and the user has the list of moves and of champions Apollo could not match.
