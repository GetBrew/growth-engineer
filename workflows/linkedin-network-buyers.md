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
- `max_lookups`: the most companies to look up in one run, since each costs an Apollo credit, e.g. 150
- `campaign`: the HeyReach campaign that messages people already connected to you, set up once, e.g. Warm network
- `min_confidence`: the confidence below which you judge a connection yourself, e.g. 0.75

## Steps

1. **Read the export**. Read `connections_file` and keep each connection's name, profile URL, company, position and connection date.
2. **Sort by role** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each connection's position and company as the state, with a choice `role` over `target_roles` plus other. Keep the connections with a target role, with its confidence.
3. **Look up their companies** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). Look up each kept connection's company by name, once per company, up to `max_lookups`. Keep each company's domain, industry, employee count and short description.
4. **Score the companies** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each company's facts as the state, with a score `fit` against `ideal_customer` on four levels (no fit, weak, good, ideal). Keep each company's most likely level and its confidence.
5. **Settle the unsure ones**. Show the user the connections whose role or fit confidence is below `min_confidence`, and keep what the user decides. Keep the connections at companies scored good or ideal.
6. **Add them to the campaign** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). After the user approves, add each kept connection to `campaign` by profile URL.

## Notes

The people who already accepted your connection request are the warmest list you have, and a large network hides them under years of recruiters, classmates and conference contacts. Sorting by role first keeps the paid company lookups to the connections that could be buyers.

The export holds names, positions and companies, and an email only when the connection allows it; keep the file private and delete it after the run.
