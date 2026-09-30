---
title: Email buyers at newly funded companies
summary: Finds companies that just raised with People Data Labs, gets each buyer's email from Apollo, and queues an approved email in lemlist.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
featured: true
added: 2026-09-22
updated: 2026-09-29
---

## Outcome

- A table of every funded company with its buyer and their work email, or a note on why there is none.
- An approved three-sentence email for each buyer, queued in your lemlist campaign.

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `funding_window`: how fresh the round must be, e.g. 30 days
- `max_companies`: the most companies to pull, since each costs a credit, e.g. 50
- `buyer_titles`: the roles to reach, most senior first, e.g. VP Marketing, Head of Growth
- `offer`: what you sell, in one line, e.g. outbound email that books meetings
- `campaign`: the lemlist campaign that sends the emails from your mailbox, by name, e.g. Funding outreach
- `email_variable`: the custom variable the campaign's email prints as its whole body, set up once in lemlist, e.g. drafted_email

## Steps

1. **Find funded companies** with [people-data-labs/search-companies](../companies/people-data-labs/tools/search-companies.md). List up to `max_companies` companies matching `target_segment` whose `last_funding_date` falls within `funding_window`. Keep name, website, latest round and date.
2. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). For each company's domain, find people with `buyer_titles` and keep the most senior, with their Apollo id; note the companies with no match.
3. **Get their emails** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich each buyer, up to 10 per call. Keep their name, title and work email.
4. **Write emails**. Draft a three-sentence plain-text email per contact: congratulate the round, connect it to `offer`, ask one question. Show the drafts to the user.
5. **Send** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each contact to `campaign` with their approved email in `email_variable`.
