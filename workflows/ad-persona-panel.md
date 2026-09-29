---
title: Test ad drafts against your buyer personas before you spend
summary: Asks Jev whether each buyer persona would stop for, understand and believe each ad draft, ranks the drafts, and saves the grid in Notion.
author: thedogwiththedataonit
motion: content
updated: 2026-09-29
---

## Outcome

- A grid of every ad draft against every persona, with the probability that the persona stops, understands the offer and believes the claim.
- The drafts ranked for each persona, with the ones no persona would stop for marked to cut.
- A Notion page with the grid and the ranking.

## Inputs

- `ad_drafts`: the ads to test, each with a short name, its headline and its body, e.g. speed: "Launch campaigns in minutes"; proof: "How Globex cut churn 18%"
- `personas`: your buyer personas, each a few lines on who they are, what they care about and what they are tired of hearing, e.g. ops_lead: runs sales operations at a 200-person company, measured on forecast accuracy, ignores "AI-powered" claims
- `channel`: where the ads will run, e.g. LinkedIn feed
- `report_parent`: the Notion page the report goes under, e.g. Ad tests

## Steps

1. **Ask the panel** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). For each pair of a draft and a persona, send the persona's description, `channel` and the draft as the state, with a noul `stops` (this person would stop scrolling for it), a noul `understands_offer` (after one read they could say what is offered), a noul `believes_claim` (they would believe the main claim) and a noul `feels_like_them` (it speaks to their situation). Keep the four probabilities for every pair.
2. **Rank the drafts**. For each persona, rank the drafts by `stops`, breaking ties by `understands_offer`. Mark the drafts that no persona is likely to stop for, and the ones that stop people who then don't understand the offer.
3. **Save the report** with [notion/create-page](../companies/notion/tools/create-page.md). After the user approves, create a page under `report_parent` with the grid, the ranking for each persona and the drafts to cut.

## Notes

A panel of described personas narrows the drafts before money goes behind them; it does not replace a live test. Spend on the drafts that rank well for the persona you are buying, and use the live results to rewrite the persona descriptions, since those descriptions are what Jev judges against.

Each draft-and-persona pair is one request with four questions, so a grid of 20 drafts and 5 personas is 100 requests.
