---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 1
updated: 2026-09-27
---

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `campaign_id`: the lemlist campaign that sends the emails from your mailbox, e.g. cam_123; its email reads each lead's drafted text from a custom variable

## Steps

1. **Find funded companies** with [people-data-labs/search-companies](../companies/people-data-labs/tools/search-companies.md). List companies matching `target_segment` whose `last_funding_date` falls in the last 30 days. Keep name, domain, latest round and date.
2. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). For each company, find the head of growth or marketing; skip companies with no match.
3. **Get their emails** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich each buyer, up to 10 per call. Keep their name, title and work email.
4. **Write emails** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft a three-sentence plain-text email per contact: congratulate the round, name one thing they will now have budget for, ask one question. Show the drafts to the user.
5. **Send** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each contact to `campaign_id` with their approved email as a custom variable.

## Done when

- Every funded company has a contact, or a note explaining why not.
- Every approved contact is in the campaign, and the user has a summary table.
