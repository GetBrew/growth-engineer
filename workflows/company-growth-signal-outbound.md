---
title: Reach companies whose hiring signals show they need you
summary: Shortlists your ICP, flags hiring-surge and job-posting signals, finds the buyer, and drafts an opener that names the signal.
author: shipgtm
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A shortlist of companies with a hiring-surge or job-posting signal, and the signal itself.
- The buyer at each remaining company, with their work email.
- An approved opening line for each buyer that names the signal, with no pitch.

## Inputs

- `target_segment`: the kind of company to shortlist, e.g. Series A-B B2B SaaS in the US
- `job_titles`: the roles whose growth signals a need for your product, e.g. Head of Sales, SDR, Sales Ops
- `buyer_titles`: who to reach at each company, e.g. VP Sales, Head of Revenue Operations
- `max_companies`: the most companies to check signals for in one run, since each costs credits, e.g. 100

## Steps

1. **Shortlist the ICP** with [people-data-labs/search-companies](../companies/people-data-labs/tools/search-companies.md). Search for companies matching `target_segment`, up to `max_companies`. Keep each company's name and domain.
2. **Check for a hiring signal** with [lusha/get-company-signals](../companies/lusha/tools/get-company-signals.md). Look up hiring-surge and headcount-growth signals for the shortlist. Keep the companies with a signal, its type and its date.
3. **Confirm the open roles** with [people-data-labs/enrich-company](../companies/people-data-labs/tools/enrich-company.md). Enrich each remaining company and check its job-posting insights for open roles matching `job_titles`. Keep the companies with a match, with the roles found.
4. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). At each kept company, find the person matching `buyer_titles`, most senior first. Keep their name, title and company.
5. **Get their work email** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich them, up to 10 per call. Keep name, title and work email.
6. **Write the opener**. Draft one sentence per buyer that names the signal, the hiring surge or the specific open role, and the problem it hints at, with no pitch. Show the drafts to the user.

## Notes

Complements a job-board search like `hiring-signal-outbound`: this one starts from company-level growth signals (headcount, hiring surges) rather than the text of a single job post, so it catches roles that never made it to a public listing.

Adapted from ShipGTM's [signal-based lead list guide](https://shipgtm.substack.com/p/signal-based-lead-lists-job-postings).
