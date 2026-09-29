---
title: Email companies whose job posts show they need your product
summary: Finds new job posts for roles you support with Exa, checks each for a real need or a competitor with Jev, and emails the hiring team.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every job post found, with the company, the role, whether it signals a need, the competitor it names and Jev's confidence.
- The buyer at each company with a real need, with their work email.
- An approved opening line for each buyer that points to the job post, queued in your lemlist campaign.

## Inputs

- `role_queries`: the job posts that signal a need, as searches, e.g. hiring first revenue operations manager; SDR team lead job
- `category`: what your product does, in a buyer's words, e.g. sales engagement software
- `competitors`: the tools a job post might name that you replace, e.g. Outreach, Salesloft
- `job_boards`: the job board domains to search, e.g. greenhouse.io, lever.co, ashbyhq.com
- `lookback_days`: how recent a post counts, e.g. 14
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `buyer_titles`: who to email at each company, e.g. VP Sales, Head of Revenue Operations
- `max_enrichments`: the most people to enrich in one run, since each match costs an Apollo credit, e.g. 50
- `campaign`: the lemlist campaign that sends the emails, set up once with a `job_post_line` custom variable, e.g. Hiring signal

## Steps

1. **Find job posts** with [exa/search-web](../companies/exa/tools/search-web.md). Search each of `role_queries` on `job_boards`, published in the last `lookback_days`, with each page's text. Keep each post's URL, job title, company name, the company's own website domain when the post shows it, and the text; drop duplicates.
2. **Read each post** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the job title and text as the state, with a choice `signal` of exact (the role that uses `category` or that `category` would replace), adjacent (a role that works alongside `category`) and generic (a general hiring push unrelated to `category`), a noul `names_category` (the post says the team will buy, build or run `category`), and a choice `competitor` over `competitors` plus none. Keep every answer with its confidence or probability.
3. **Keep the real needs**. Keep the posts whose signal is exact or whose `names_category` is yes, one per company. Show the user the posts whose signal confidence is below `min_confidence` or whose `names_category` is unsure, and keep the ones the user confirms.
4. **Find the domains** with [exa/search-web](../companies/exa/tools/search-web.md). For each kept company whose post showed no domain, search company pages for its name. Keep the domains you can confirm, and drop the companies you can't.
5. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). Search each kept company's domain for `buyer_titles`. Keep the best match's Apollo ID, first name and title.
6. **Get their emails** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich up to `max_enrichments` buyers by their Apollo IDs, ten per call. Keep each buyer's full name and work email; list who has none.
7. **Write the opening lines**. Draft one sentence per buyer that names the role they are hiring for and the problem it hints at, with no pitch. Show the lines to the user.
8. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each buyer to `campaign` with their approved line in `job_post_line`.

## Notes

A job post is the company describing its problem in its own words, and while the role is open the team is still deciding how to solve it. A post that names a competitor is a displacement play: give those buyers a separate campaign whose copy is about switching.

Run it weekly with `lookback_days` set to 7 so each post is seen once.
