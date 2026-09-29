---
title: Sort AI answers by how they treat your brand
summary: Pulls the AI answers Profound recorded for your category, labels how each one treats your brand with Jev, and saves a report in Notion.
author: thedogwiththedataonit
motion: content
updated: 2026-09-29
---

## Outcome

- A table of every answer read, with how it treats your brand, the product it recommends first, the prompt's buying stage and Jev's confidence.
- The answers that describe you negatively or contradict your facts, quoted and checked by you.
- A Notion page with the counts by engine and buying stage, and the answers to fix first.

## Inputs

- `category`: the Profound category to read, by name, e.g. Email marketing platforms
- `brand`: your product's name as buyers write it, e.g. Acme
- `competitors`: the products an answer might recommend instead, e.g. Mailchimp, Klaviyo, Brevo
- `brand_facts`: the facts about you an answer should get right, e.g. has a free plan; integrates with Shopify; SOC 2 Type II
- `lookback_days`: how many days of answers to read, e.g. 7
- `max_answers`: the most answers to read in one run, e.g. 300
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `report_parent`: the Notion page the report goes under, by name, e.g. AI visibility

## Steps

1. **Find the organizations** with [profound/list-organizations](../companies/profound/tools/list-organizations.md). Keep each organization's ID.
2. **Find the category** with [profound/list-categories](../companies/profound/tools/list-categories.md). List each organization's categories. Keep the organization and category IDs of `category`.
3. **Pull the answers** with [profound/get-prompt-answers](../companies/profound/tools/get-prompt-answers.md). Get the answers recorded in the last `lookback_days`, up to `max_answers`. Keep each answer's prompt, engine, date and text.
4. **Read each answer** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the prompt, the answer and `brand_facts` as the state, with a choice `position` of recommended_first, recommended, listed (named without a recommendation), mentioned_with_caveat, mentioned_negatively and absent, all about `brand`; a choice `top_pick` over `brand`, `competitors`, another_product and none, for the product the answer recommends first; a choice `stage` of problem, solution, comparison and brand, for what the prompt asks; and a noul `contradicts_facts` (says something about `brand` that `brand_facts` contradicts). Keep every answer with its confidence or probability.
5. **Check the unsure ones with the user**. Show the user every answer whose position, top_pick or stage confidence is below `min_confidence`, every answer mentioned_negatively, and every answer whose `contradicts_facts` is yes or unsure, quoted, and keep what the user decides.
6. **Find what to fix**. Count the answers by position, engine and stage. List the answers where `brand` is mentioned negatively or contradicts its facts, quoted, and the comparison prompts where a competitor is the top pick.
7. **Save the report** with [notion/create-page](../companies/notion/tools/create-page.md). After the user approves, create a page under `report_parent`, found with a read-only Notion search, with the counts, the quoted answers and the comparison prompts to fix first.

## Notes

Visibility scores count mentions, and an answer that lists you last with a caveat counts the same as one that recommends you first. The position labels tell them apart. For an answer that contradicts your facts, check the pages the engine cites before writing new content.

Run it weekly with `lookback_days` set to 7.
