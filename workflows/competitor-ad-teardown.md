---
title: Break down competitors' longest-running ads
summary: Scrapes competitors' Meta Ad Library ads with an Apify Actor, labels each ad's hook and offer with Jev, and saves the patterns to Notion.
author: thedogwiththedataonit
motion: content
updated: 2026-09-29
---

## Outcome

- A table of every competitor ad found, with its hook, offer, awareness stage, days running and Jev's confidence.
- The hooks, offers and stages that are common in the ads that have run longest, compared with newer ads.
- A Notion page with those patterns and an example ad for each.

## Inputs

- `competitors`: the brands to study, as their Facebook page names or Ad Library URLs, e.g. Acme, Globex
- `country`: where the ads run, as a two-letter code, e.g. US
- `min_days`: how long an ad must have run to count as a long runner, e.g. 60
- `max_spend_usd`: the most the scraper run may cost, e.g. 5
- `report_parent`: the Notion page the report goes under, e.g. Competitive research

## Steps

1. **Pick a scraper** with [apify/search-actors](../companies/apify/tools/search-actors.md). Search Apify Store for a Facebook Ad Library scraper. Show the user the top results with their authors and descriptions, and keep the Actor the user picks.
2. **Run it** with [apify/run-actor](../companies/apify/tools/run-actor.md). After the user approves, run the Actor on `competitors` for active ads in `country`, capped at `max_spend_usd`. Keep the run's dataset ID.
3. **Read the ads** with [apify/get-dataset-items](../companies/apify/tools/get-dataset-items.md). Keep each ad's brand, text, headline, call to action, landing page URL, media type and start date, and work out how many days each has run.
4. **Label each ad** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each ad's text, headline, call to action and media type as the state, with a choice `hook` of pain_point, outcome_promise, social_proof, curiosity, offer, comparison, founder_story and how_to, a choice `offer` of free_trial, demo, discount, lead_magnet, webinar and none, and a choice `awareness` of problem_unaware, problem_aware, solution_aware, product_aware and most_aware. Keep every answer with its confidence.
5. **Find the patterns**. Compare the ads running `min_days` or longer with the newer ones: which hooks, offers and awareness stages each brand keeps running, and which it keeps testing. Pick one example ad per pattern.
6. **Save the report** with [notion/create-page](../companies/notion/tools/create-page.md). After the user approves, create a page under `report_parent` with the patterns, the example ads and the full table.

## Notes

An ad that keeps running for months is one its owner keeps paying for, so the long runners are a public hint at what converts. Days running are worked out from the start dates, not by Jev, which reads dates as text.

Apify Store Actors are built by third parties: check the Actor's output fields and price before the run, and use the ads for research rather than copying them.
