---
title: Sort AI answers by how they treat your brand
summary: Pulls the AI answers Profound recorded for your category, labels how each one treats your brand with Jev, and saves a report in Notion.
author: thedogwiththedataonit
motion: content
updated: 2026-09-29
---

## Outcome

- A table of every recorded answer with how it treats your brand, the product it recommends first, the prompt's buying stage and Jev's confidence.
- The answers that describe you negatively or contradict your facts, quoted.
- A Notion page with the counts by engine and buying stage, and the answers to fix first.

## Inputs

- `category`: the Profound category to read, by name, e.g. Email marketing platforms
- `brand`: your product's name as buyers write it, e.g. Acme
- `competitors`: the products an answer might recommend instead, e.g. Mailchimp, Klaviyo, Brevo
- `brand_facts`: the facts about you an answer should get right, e.g. has a free plan; integrates with Shopify; SOC 2 Type II
- `lookback_days`: how many days of answers to read, e.g. 7
- `report_parent`: the Notion page the report goes under, e.g. AI visibility

## Steps

1. **Find the organization** with [profound/list-organizations](../companies/profound/tools/list-organizations.md). Keep the ID of the organization that tracks `category`.
2. **Find the category** with [profound/list-categories](../companies/profound/tools/list-categories.md). Keep the ID of `category`.
3. **Pull the answers** with [profound/get-prompt-answers](../companies/profound/tools/get-prompt-answers.md). Get the answers recorded in the last `lookback_days`. Keep each answer's prompt, engine, date and text.
4. **Read each answer** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the prompt, the answer and `brand_facts` as the state, with a choice `position` of recommended_first, recommended, listed, mentioned_with_caveat, mentioned_negatively and absent, all about `brand`; a choice `top_pick` over `brand`, `competitors` and none, for the product the answer recommends first; a choice `stage` of problem, solution, comparison and brand, for what the prompt asks; and a noul `contradicts_facts` (says something about `brand` that `brand_facts` contradicts). Keep every answer with its confidence or probability.
5. **Find what to fix**. Count answers by position, engine and stage. List the answers where `brand` is mentioned negatively or `contradicts_facts` is likely, quoted, and the comparison prompts where a competitor is the top pick.
6. **Save the report** with [notion/create-page](../companies/notion/tools/create-page.md). After the user approves, create a page under `report_parent` with the counts, the quoted answers and the comparison prompts to fix first.

## Notes

Visibility scores say how often you appear; this play says how: an answer that lists you last with a caveat and one that recommends you first both count as a mention. For an answer that contradicts your facts, check the pages the engine cites before writing new content.

Run it weekly with `lookback_days` set to 7.
