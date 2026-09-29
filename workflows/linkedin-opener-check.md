---
title: Pick the best LinkedIn opener for each lead before sending
summary: Finds leads with Crustdata, checks each lead's role and picks the opener that fits them with Jev, and adds them to that opener's campaign.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:linkedin
updated: 2026-09-29
---

## Outcome

- Each draft opener checked, with any that pitches, asks for more than one thing or talks about the sender flagged.
- A table of every lead with whether they hold a target role, the opener picked for them and Jev's confidence.
- Each approved lead added to the HeyReach campaign that sends their opener.

## Inputs

- `target_segment`: the people to reach, e.g. heads of growth at B2B software companies with 50 to 500 employees in the US
- `target_roles`: the roles you sell to, each with one line, e.g. growth_lead: owns acquisition or activation; marketing_lead: runs marketing; founder: a founder at a company under 50 people
- `openers`: two to five draft first messages, each with a short name, e.g. benchmark: a question about their activation rate; teardown: an offer to share a teardown of their onboarding
- `campaigns`: the HeyReach campaign that sends each opener, by name, set up once, e.g. benchmark: Openers A; teardown: Openers B
- `max_leads`: the most leads to add in one run, e.g. 200
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it

## Steps

1. **Check the openers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each opener's text as the state, with a noul `pitches_product` (asks for a meeting or describes the product), a noul `one_ask` (asks for exactly one thing) and a noul `about_them` (is about the reader, not the sender). Show the user the openers that pitch, don't ask for exactly one thing or aren't about the reader, or where an answer is unsure. Keep the openers that pass every check and the flagged ones the user approves.
2. **Find the leads** with [crustdata/search-people](../companies/crustdata/tools/search-people.md). Search for `target_segment`, up to `max_leads` people. Keep each person's name, title, company, LinkedIn profile URL, and headline when it has one.
3. **Match leads to openers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each lead's title, headline and company as the state, with a choice `role` over `target_roles` plus other, and a choice `opener` over the approved openers' names, each described by its text, for the opener that best fits this person's role and situation. Keep each lead's role, opener and their confidences.
4. **Check the unsure ones with the user**. Drop the leads whose role is other. Show the user every lead whose role or opener confidence is below `min_confidence`, and keep what the user picks.
5. **Add them to the campaigns** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). After the user approves, look up each campaign in `campaigns` by name, a read-only call, and add each lead by LinkedIn profile URL to the campaign for their opener.

## Notes

One campaign per opener keeps the results apart: HeyReach's reply rate per campaign then shows how each opener does with the people it was matched to. LinkedIn's User Agreement restricts automated activity, so keep volumes within your sender accounts' limits.

Run it before each new batch of leads, and drop the weaker openers once their campaigns have enough replies to judge.
