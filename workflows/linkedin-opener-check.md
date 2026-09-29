---
title: Pick the best LinkedIn opener for each lead before sending
summary: Finds leads with Apollo, checks each lead's role and picks the opener that fits them with Jev, and adds them to that opener's campaign.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:linkedin
updated: 2026-09-29
---

## Outcome

- A check of each draft opener, with the ones that pitch too early or ask for more than one thing flagged.
- A table of every lead with whether they hold a target role, the opener picked for them and Jev's confidence.
- Each approved lead added to the HeyReach campaign that sends their opener.

## Inputs

- `target_segment`: the people to reach, e.g. heads of growth at B2B software companies with 50 to 500 employees in the US
- `target_roles`: the roles you sell to, each with one line, e.g. growth_lead: owns acquisition or activation; marketing_lead: runs marketing; founder: a founder at a company under 50 people
- `openers`: two to five draft first messages, each with a short name, e.g. benchmark: a question about their activation rate; teardown: an offer to share a teardown of their onboarding
- `campaigns`: the HeyReach campaign that sends each opener, set up once, e.g. benchmark: Openers A; teardown: Openers B
- `max_leads`: the most leads to add in one run, e.g. 200
- `min_confidence`: the confidence below which you pick a lead's opener yourself, e.g. 0.7

## Steps

1. **Check the openers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each opener's text as the state, with a noul `pitches_product` (asks for a meeting or describes the product), a noul `one_ask` (asks for exactly one thing) and a noul `about_them` (is about the reader, not the sender). Show the user the openers that pitch, ask for more than one thing or are about the sender, and keep the ones the user approves.
2. **Find the leads** with [apollo/search-people](../companies/apollo/tools/search-people.md). Search for `target_segment`, up to `max_leads` people. Keep each person's name, title, headline, company and LinkedIn URL.
3. **Match leads to openers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each lead's title, headline and company, with the approved openers, as the state, with a choice `role` over `target_roles` plus other, and a choice `opener` over the approved openers' names, each described by its text, for the one this person is most likely to answer. Keep each lead's role, opener and confidences.
4. **Settle the unsure ones**. Drop the leads whose role is other. Show the user every lead whose opener confidence is below `min_confidence`, and keep the opener the user picks.
5. **Add them to the campaigns** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). After the user approves, add each lead by LinkedIn URL to the campaign in `campaigns` for their opener.

## Notes

Checking openers takes one request each, and matching a lead takes one more, so a list of a few hundred leads is checked in minutes rather than after the campaign has already burned through it. Keep one campaign per opener: HeyReach's reply rates per campaign then tell you which opener works for which role.

Run it before each new batch of leads, and drop an opener once its campaign has enough replies to judge.
