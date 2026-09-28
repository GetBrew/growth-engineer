---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: true
updated: 2026-09-27
---

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `funding_window`: how fresh the round must be, e.g. 30 days
- `max_companies`: the most companies to pull, since each costs a credit, e.g. 50
- `buyer_titles`: the roles to reach, most senior first, e.g. VP Marketing, Head of Growth
- `offer`: what you sell, in one line, e.g. outbound email that books meetings
- `campaign_id`: the lemlist campaign that sends the emails from your mailbox, e.g. cam_123
- `email_variable`: the custom variable that campaign's email prints as its body, e.g. drafted_email

## Steps

1. **Find funded companies** with [people-data-labs/search-companies](../companies/people-data-labs/tools/search-companies.md). List up to `max_companies` companies matching `target_segment` whose `last_funding_date` falls within `funding_window`. Keep name, website, latest round and date.
2. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). For each company's domain, find people with `buyer_titles` and keep the most senior, with their Apollo id; note the companies with no match.
3. **Get their emails** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich each buyer, up to 10 per call. Keep their name, title and work email.
4. **Write emails**. Draft a three-sentence plain-text email per contact: congratulate the round, connect it to `offer`, ask one question. Show the drafts to the user.
5. **Send** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each contact to `campaign_id` with their approved email in `email_variable`.

## Done when

- Every funded company has a contact, or a note explaining why not.
- Every approved contact is in the campaign, and the user has a summary table.
