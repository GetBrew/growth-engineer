---
title: Turn a hiring signal into a worked LinkedIn lead
summary: Shortlists your ICP in Clay, watches for a matching job posting, logs the lead in Salesforce, and queues a LinkedIn opener in HeyReach.
author: shipgtm
motion: outbound
tags:
  - channel:linkedin
updated: 2026-09-29
---

## Outcome

- A shortlist of companies in Clay with a live watch for job postings matching the roles you're targeting.
- The buyer at each company that gets a hit, with their work email and LinkedIn profile.
- A Salesforce lead logged for each buyer, and an approved LinkedIn opener queued in HeyReach.

## Inputs

- `target_segment`: the kind of company to shortlist, e.g. Series A-B B2B SaaS in the US
- `job_titles`: the roles whose posting signals a need for your product, e.g. Head of Sales, SDR, Sales Ops
- `buyer_titles`: who to reach at each company once its posting hits, e.g. VP Sales, Head of Revenue Operations
- `max_companies`: the most companies to shortlist in one run, since each result costs credits, e.g. 100

## Steps

1. **Shortlist the ICP** with [clay/search-people-and-companies](../companies/clay/tools/search-people-and-companies.md). Query Clay's company database for `target_segment`, up to `max_companies`. Keep each company's name and domain.
2. **Watch for a job posting** with [clay/create-signal](../companies/clay/tools/create-signal.md). Create a signal on the shortlist that fires on a job posting matching `job_titles`.
3. **Find the buyer** with [clay/search-people-and-companies](../companies/clay/tools/search-people-and-companies.md). At each company whose signal fires, search people matching `buyer_titles`, most senior first. Keep their name, title and LinkedIn profile URL.
4. **Get their work email** with [clay/run-routine](../companies/clay/tools/run-routine.md). Run the Work Email routine with their name, company name and domain. Keep the email it returns.
5. **Write the opener**. Draft one sentence that names the role the company is hiring for and the problem it hints at, with no pitch. Show the drafts to the user.
6. **Log the lead** with [salesforce/create-record](../companies/salesforce/tools/create-record.md). Create a Lead for each buyer whose draft the user approved, with the job posting noted.
7. **Queue the LinkedIn message** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). Add each approved buyer, by their LinkedIn profile URL, to a HeyReach campaign set up with the opener as its first-touch copy.

## Notes

Step 7 needs a HeyReach campaign already built with LinkedIn sender accounts assigned; point every approved lead at it rather than one campaign per run.

Steps 1 and 2 can run on [sumble/search-organizations](../companies/sumble/tools/search-organizations.md) and [sumble/search-jobs](../companies/sumble/tools/search-jobs.md), or on [coresignal/search-companies](../companies/coresignal/tools/search-companies.md) and [coresignal/search-jobs](../companies/coresignal/tools/search-jobs.md), instead of Clay — the guide names both as job-posting data sources with the same shape.

Adapted from ShipGTM's [signal-based lead list guide](https://shipgtm.substack.com/p/signal-based-lead-lists-job-postings), which builds this on Clay, Salesforce and LinkedIn, and names Sumble and CoreSignal as alternative data sources.
