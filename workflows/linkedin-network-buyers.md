---
title: Find the buyers already in your LinkedIn connections
summary: Reads your LinkedIn connections export, keeps the people in roles and companies you sell to with Jev, and adds them to a HeyReach campaign.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:linkedin
updated: 2026-09-29
---

## Outcome

- A table of your connections in the roles you sell to, with their company's fit level and Jev's confidence.
- The connections at companies that fit, added to your HeyReach campaign after your approval.

## Inputs

- `connections_file`: the Connections.csv from LinkedIn's "Get a copy of your data" export, e.g. ~/Downloads/Connections.csv
- `target_roles`: the roles you sell to, each with one line, e.g. economic_buyer: owns the budget for sales tools; champion: runs sales operations day to day
- `ideal_customer`: the companies you sell to, in a sentence or two, e.g. B2B software companies with 50 to 1,000 employees and a sales team
- `min_fit`: the lowest company fit level worth a message, e.g. good
- `max_lookups`: the most companies to look up in one run, since each match is charged, e.g. 150
- `campaign`: the HeyReach campaign for these people, set up once with only your own LinkedIn account as its sender and a message as its first step, by name, e.g. Warm network
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8

## Steps

1. **Read the export**. Read `connections_file`, skipping the notes above its header row, and keep each connection's name, profile URL, company, position and connection date.
2. **Sort by role** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each connection's position and company as the state, with a choice `role` over `target_roles` plus other. Keep the connections with a target role, with its confidence.
3. **Look up their companies** with [people-data-labs/enrich-company](../companies/people-data-labs/tools/enrich-company.md). Look up each kept connection's company by name, once per company, up to `max_lookups`. Keep each company's website, industry, size and summary.
4. **Score the companies** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each company's facts as the state, with a score `fit` whose levels describe the match with `ideal_customer`: no fit (matches none of it), weak (matches some), good (matches most) and ideal (matches all). Keep each company's most likely level and its confidence.
5. **Check the unsure ones with the user**. Show the user the connections whose role or fit confidence is below `min_confidence`, and keep what the user decides. Keep the connections at companies with a fit of `min_fit` or better.
6. **Add them to the campaign** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). After the user approves, look up `campaign` by name, a read-only call, and add each kept connection by profile URL.

## Notes

People already connected to you are a warm list, but in a large network they are mixed in with recruiters, classmates and conference contacts. Sorting by role first keeps the paid company lookups to the connections that could be buyers.

The export holds names, positions and companies, and an email only when the connection allows it; keep the file private and delete it after the run. LinkedIn's User Agreement restricts automated activity, so keep the messages personal and the volume low.
