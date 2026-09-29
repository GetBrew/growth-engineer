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

- `competitors`: the brands to study, as their Meta Ad Library page URLs, e.g. the Ad Library pages of Acme and Globex
- `country`: where the ads run, as a two-letter code, e.g. US
- `min_days`: how long an ad must have run to count as a long runner, e.g. 60
- `max_spend_usd`: the most the scraper run may cost, e.g. 5
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8
- `report_parent`: the Notion page the report goes under, by name, e.g. Competitive research

## Steps

1. **Pick a scraper** with [apify/search-actors](../companies/apify/tools/search-actors.md). Search Apify Store for a Facebook Ad Library scraper. Show the user the top results with their authors, descriptions and Store pages, and keep the Actor the user picks once they have checked its price and terms.
2. **Run it** with [apify/run-actor](../companies/apify/tools/run-actor.md). After the user approves, read the Actor's input fields, then run it on `competitors` for active ads in `country`, capped at `max_spend_usd` with `maxTotalChargeUsd` or by the Actor's own item limit; if your way in can't set a cap, show the user the Actor's price and the expected number of ads first. Keep the run's dataset ID.
3. **Read the ads** with [apify/get-dataset-items](../companies/apify/tools/get-dataset-items.md). Keep each ad's brand, text, headline, call to action, landing page URL, media type and start date, and work out how many days each has run.
4. **Label each ad** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each ad's text, headline, call to action and media type as the state, with a choice `hook` of pain_point (opens on a problem), outcome_promise (opens on a result), social_proof (opens on customers or numbers), curiosity (opens on a question or a surprise), offer (opens on a deal), comparison (against another way or product), founder_story (a founder speaking) and how_to (teaches something); a choice `offer` of free_trial, demo, discount, lead_magnet, webinar and none; and a choice `awareness` of problem_unaware, problem_aware, solution_aware, product_aware and most_aware. Keep every answer with its confidence.
5. **Find the patterns**. Leave the ads whose hook or offer confidence is below `min_confidence` out of the counts, and list them. Compare the ads running `min_days` or longer with the newer ones: which hooks, offers and awareness stages each brand keeps running, and which it keeps testing. Pick one example ad per pattern.
6. **Save the report** with [notion/create-page](../companies/notion/tools/create-page.md). After the user approves, create a page under `report_parent`, found with a read-only Notion search, with the patterns, the example ads and the full table.

## Notes

An ad that keeps running for months is one its owner keeps paying for, so the long runners are a public hint at what converts. Days running are worked out from the start dates, not by Jev, which reads dates as text, and Jev reads only the ad's words, so a hook carried by the image or video is missed.

Apify Store Actors are built by third parties, and Meta's terms restrict collecting data by automated means: read Meta's terms and the Actor's before you run it, and use Meta's Ad Library API where it covers the ads you need. Use the ads for research, not to copy them.
